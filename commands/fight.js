const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { getUserData, updateUserData, getActivePokemon, createBattleImage, getCachedBattleImage, setCachedBattleImage } = require('../utils/helpers.js');
const { createPokeBallButtons } = require('../utils/buttonUtils.js');
const catchModule = require('./catch.js');

module.exports = {
    async execute(interaction, originalMessage, encounterId) {
        const userId = interaction.user.id;
        const username = interaction.user.username;
        const avatarUrl = interaction.user.displayAvatarURL({ format: 'png', dynamic: true });
        console.log("Fight command executed for user:", userId);

        try {
            // Determine how to reply based on the context
            let replyFunction;
            if (originalMessage) {
                // If originalMessage is provided, we're in the context of a button interaction
                replyFunction = (options) => originalMessage.edit(options);
            } else {
                // We're in the context of a standalone command
                replyFunction = interaction.deferred || interaction.replied ? 
                    (options) => interaction.editReply(options) : 
                    (options) => interaction.reply(options);
            }

            // Fetch user data
            const userData = await getUserData(userId);
            console.log("User data retrieved:", JSON.stringify(userData, null, 2));

            if (!userData) {
                console.error("User data not found for user:", userId);
                return replyFunction({ content: "Error: User data not found. Please try starting your journey again.", ephemeral: true });
            }

            if (!userData.pokemon || userData.pokemon.length === 0) {
                console.error("User has no Pokémon:", userId);
                return replyFunction({ content: "Error: You don't have any Pokémon. Please start your journey again.", ephemeral: true });
            }

            const wildPokemon = userData.currentWildPokemon;
            console.log("Wild Pokemon data:", JSON.stringify(wildPokemon, null, 2));

            if (!wildPokemon || wildPokemon.encounterId !== encounterId) {
                console.error("Invalid wild Pokemon data for user:", userId);
                return replyFunction({ content: "This wild Pokémon is no longer available. Try encountering a new one!", ephemeral: true });
            }

            const userPokemon = await getActivePokemon(userData);
            console.log("User Pokemon data:", JSON.stringify(userPokemon, null, 2));

            if (!userPokemon) {
                console.error("Active Pokémon not found for user:", userId);
                return replyFunction({ content: "Error: Active Pokémon not found. Please try again.", ephemeral: true });
            }

            // Create battle image
            let battleImage;
            try {
                 battleImage = getCachedBattleImage(userData, wildPokemon.name, wildPokemon.isShiny, wildPokemon.level);
                 if (!battleImage) {
                    battleImage = await createBattleImage(userData, wildPokemon.name, wildPokemon.isShiny, wildPokemon.level);
                    setCachedBattleImage(userData, wildPokemon.name, wildPokemon.isShiny, wildPokemon.level, battleImage);
                }
            } 
            catch (imageError) {
                console.error('Error creating or retrieving battle image:', imageError);
    // Proceed without the image if there's an error
    }

            const expGained = Math.floor(wildPokemon.level * 10);
            const coinReward = Math.floor(wildPokemon.level * 5);

            userPokemon.exp += expGained;
            userData.money += coinReward;
            userData.currentWildPokemon.defeated = true;

            const shinyEmoji = wildPokemon.isShiny ? '✨ ' : '';

            const resultEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setAuthor({ 
                    name: username || 'Trainer',
                    iconURL: avatarUrl
                })
                .setTitle('Battle Completed')
                .setDescription(`${userPokemon.name} defeated the wild ${shinyEmoji}${wildPokemon.name}!
                Gained ${expGained} EXP and ${coinReward} coins.
                ${wildPokemon.isShiny ? '(It was a shiny Pokémon!)' : ''}`);

            if (battleImage) {
                resultEmbed.setImage('attachment://battle.png');
            }

            const pokeBallButtons = createPokeBallButtons(userData, encounterId);

            const replyOptions = { 
                embeds: [resultEmbed], 
                components: [pokeBallButtons],
                fetchReply: true 
            };

            if (battleImage) {
                replyOptions.files = [new AttachmentBuilder(battleImage, { name: 'battle.png' })];
            }

            console.log('Sending fight reply...');
            const fightReply = await replyFunction(replyOptions);
            console.log('Fight reply sent successfully');

            // Update user data after sending the reply
            await updateUserData(userId, userData);

            // Set up collector for catch attempts
            const catchCollector = fightReply.createMessageComponentCollector({ time: 30000 });

            catchCollector.on('collect', async i => {
                if (i.user.id !== userId) {
                    return i.reply({ content: "This isn't your catch attempt!", ephemeral: true });
                }

                await catchModule.handleCatchAttempt(i, fightReply, encounterId);
            });

            catchCollector.on('end', collected => {
                console.log(`Collector ended for fight command. User: ${userId}, Reason: ${collected.size === 0 ? 'time' : 'interaction'}, Interactions collected: ${collected.size}`);
                if (collected.size === 0) {
                    fightReply.edit({ components: [] }).catch(console.error);
                }
            });

        } catch (error) {
            console.error('Error in fight command:', error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error processing the battle. Please try again.', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error processing the battle. Please try again.', ephemeral: true });
            }
        }
    }
};