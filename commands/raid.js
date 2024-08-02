const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
let client;
const { getUserData, updateUserData,getCustomRarity, getActivePokemon, getRaidPokemonRarity, isShiny } = require('../utils/helpers.js');

const RAID_BOSSES = [
    { name: 'Charizard-MegaX', hp: 10000, weaknesses: ['Dragon', 'Rock', 'Ground'], baseLevel: 50, type: 'Fire/Dragon' },
    { name: 'Giratina', hp: 12000, weaknesses: ['Fairy', 'Ice', 'Dragon', 'Ghost', 'Dark'], baseLevel: 55, type: 'Ghost/Dragon' },
    { name: 'Mewtwo', hp: 15000, weaknesses: ['Dark', 'Bug', 'Ghost'], baseLevel: 60, type: 'Psychic' },
    { name: 'Kyogre', hp: 11000, weaknesses: ['Electric', 'Grass'], baseLevel: 52, type: 'Water' },
    { name: 'Rayquaza', hp: 13000, weaknesses: ['Ice', 'Rock', 'Dragon', 'Fairy'], baseLevel: 58, type: 'Dragon/Flying' },
    { name: 'Zekrom', hp: 12500, weaknesses: ['Dragon', 'Ice', 'Ground', 'Fairy'], baseLevel: 56, type: 'Dragon/Electric' },
    { name: 'Reshiram', hp: 12500, weaknesses: ['Dragon', 'Rock', 'Ground'], baseLevel: 56, type: 'Dragon/Fire' },
    { name: 'Kyurem', hp: 13000, weaknesses: ['Dragon', 'Rock', 'Steel', 'Fairy', 'Fighting'], baseLevel: 57, type: 'Dragon/Ice' },
    { name: 'Zacian', hp: 14000, weaknesses: ['Steel', 'Poison'], baseLevel: 59, type: 'Fairy' },
    { name: 'Mew', hp: 11000, weaknesses: ['Dark', 'Bug', 'Ghost'], baseLevel: 54, type: 'Psychic' },
    { name: 'Genesect', hp: 11500, weaknesses: ['Fire'], baseLevel: 55, type: 'Bug/Steel' },
    { name: 'Jirachi', hp: 10500, weaknesses: ['Ghost', 'Fire', 'Dark', 'Ground'], baseLevel: 53, type: 'Steel/Psychic' },
    // New additions
    { name: 'Articuno', hp: 10000, weaknesses: ['Electric', 'Rock', 'Steel', 'Fire'], baseLevel: 50, type: 'Ice/Flying' },
    { name: 'Zapdos', hp: 10000, weaknesses: ['Ice', 'Rock'], baseLevel: 50, type: 'Electric/Flying' },
    { name: 'Moltres', hp: 10000, weaknesses: ['Water', 'Electric', 'Rock'], baseLevel: 50, type: 'Fire/Flying' },
    { name: 'Suicune', hp: 10500, weaknesses: ['Electric', 'Grass'], baseLevel: 52, type: 'Water' },
    { name: 'Entei', hp: 10500, weaknesses: ['Water', 'Ground', 'Rock'], baseLevel: 52, type: 'Fire' },
    { name: 'Raikou', hp: 10500, weaknesses: ['Ground'], baseLevel: 52, type: 'Electric' },
    { name: 'Ho-Oh', hp: 12500, weaknesses: ['Water', 'Electric', 'Rock'], baseLevel: 55, type: 'Fire/Flying' },
    { name: 'Lugia', hp: 12500, weaknesses: ['Electric', 'Ice', 'Rock', 'Ghost', 'Dark'], baseLevel: 55, type: 'Psychic/Flying' },
    { name: 'Latias', hp: 11000, weaknesses: ['Ice', 'Dragon', 'Bug', 'Fairy', 'Ghost', 'Dark'], baseLevel: 53, type: 'Dragon/Psychic' },
    { name: 'Latios', hp: 11000, weaknesses: ['Ice', 'Dragon', 'Bug', 'Fairy', 'Ghost', 'Dark'], baseLevel: 53, type: 'Dragon/Psychic' },
    { name: 'Regirock', hp: 11500, weaknesses: ['Water', 'Grass', 'Fighting', 'Ground', 'Steel'], baseLevel: 54, type: 'Rock' },
    { name: 'Regice', hp: 11500, weaknesses: ['Fire', 'Fighting', 'Rock', 'Steel'], baseLevel: 54, type: 'Ice' },
    { name: 'Registeel', hp: 11500, weaknesses: ['Fire', 'Fighting', 'Ground'], baseLevel: 54, type: 'Steel' },
    { name: 'Groudon', hp: 13000, weaknesses: ['Water', 'Grass', 'Ice'], baseLevel: 58, type: 'Ground' },
    { name: 'Uxie', hp: 10000, weaknesses: ['Dark', 'Bug', 'Ghost'], baseLevel: 50, type: 'Psychic' },
    { name: 'Mesprit', hp: 10000, weaknesses: ['Dark', 'Bug', 'Ghost'], baseLevel: 50, type: 'Psychic' },
    { name: 'Azelf', hp: 10000, weaknesses: ['Dark', 'Bug', 'Ghost'], baseLevel: 50, type: 'Psychic' },
    { name: 'Heatran', hp: 11500, weaknesses: ['Water', 'Fighting', 'Ground'], baseLevel: 54, type: 'Fire/Steel' },
    { name: 'Regigigas', hp: 12000, weaknesses: ['Fighting'], baseLevel: 55, type: 'Normal' },
    { name: 'Cresselia', hp: 11000, weaknesses: ['Dark', 'Bug', 'Ghost'], baseLevel: 53, type: 'Psychic' },
    { name: 'Dialga', hp: 13000, weaknesses: ['Fighting', 'Ground'], baseLevel: 58, type: 'Steel/Dragon' },
    { name: 'Palkia', hp: 13000, weaknesses: ['Fairy', 'Dragon'], baseLevel: 58, type: 'Water/Dragon' },
    { name: 'Tornadus', hp: 11000, weaknesses: ['Electric', 'Ice', 'Rock'], baseLevel: 53, type: 'Flying' },
    { name: 'Thundurus', hp: 11000, weaknesses: ['Ice', 'Rock'], baseLevel: 53, type: 'Electric/Flying' },
    { name: 'Landorus', hp: 11500, weaknesses: ['Ice', 'Water'], baseLevel: 54, type: 'Ground/Flying' },
    { name: 'Cobalion', hp: 11000, weaknesses: ['Fire', 'Fighting', 'Ground'], baseLevel: 53, type: 'Steel/Fighting' },
    { name: 'Terrakion', hp: 11000, weaknesses: ['Water', 'Grass', 'Fighting', 'Ground', 'Steel', 'Psychic', 'Fairy'], baseLevel: 53, type: 'Rock/Fighting' },
    { name: 'Virizion', hp: 11000, weaknesses: ['Fire', 'Flying', 'Ice', 'Poison', 'Psychic', 'Fairy'], baseLevel: 53, type: 'Grass/Fighting' },
    { name: 'Xerneas', hp: 12500, weaknesses: ['Steel', 'Poison'], baseLevel: 57, type: 'Fairy' },
    { name: 'Yveltal', hp: 12500, weaknesses: ['Electric', 'Ice', 'Rock', 'Fairy'], baseLevel: 57, type: 'Dark/Flying' },
    { name: 'Zygarde', hp: 12500, weaknesses: ['Ice', 'Dragon', 'Fairy'], baseLevel: 57, type: 'Dragon/Ground' },
    { name: 'Tapu Bulu', hp: 11000, weaknesses: ['Steel', 'Poison', 'Flying', 'Ice', 'Fire'], baseLevel: 53, type: 'Grass/Fairy' },
    { name: 'Tapu Koko', hp: 11000, weaknesses: ['Poison', 'Ground'], baseLevel: 53, type: 'Electric/Fairy' },
    { name: 'Tapu Lele', hp: 11000, weaknesses: ['Steel', 'Poison', 'Ghost'], baseLevel: 53, type: 'Psychic/Fairy' },
    { name: 'Tapu Fini', hp: 11000, weaknesses: ['Electric', 'Grass', 'Poison'], baseLevel: 53, type: 'Water/Fairy' },
    { name: 'Type:Null', hp: 10500, weaknesses: ['Fighting'], baseLevel: 52, type: 'Normal' },
    { name: 'Silvally', hp: 11000, weaknesses: ['Fighting'], baseLevel: 53, type: 'Normal' },
    { name: 'Cosmog', hp: 9000, weaknesses: ['Ghost', 'Dark', 'Bug'], baseLevel: 45, type: 'Psychic' },
    { name: 'Cosmoem', hp: 9500, weaknesses: ['Ghost', 'Dark', 'Bug'], baseLevel: 47, type: 'Psychic' },
    { name: 'Solgaleo', hp: 12500, weaknesses: ['Fire', 'Ground', 'Dark', 'Ghost'], baseLevel: 57, type: 'Psychic/Steel' },
    { name: 'Lunala', hp: 12500, weaknesses: ['Ghost', 'Dark'], baseLevel: 57, type: 'Psychic/Ghost' },
    { name: 'Necrozma', hp: 12500, weaknesses: ['Ghost', 'Dark', 'Bug'], baseLevel: 57, type: 'Psychic' },
    { name: 'Zamazenta', hp: 14000, weaknesses: ['Psychic', 'Flying', 'Fairy'], baseLevel: 59, type: 'Fighting' },
    { name: 'Regieleki', hp: 11500, weaknesses: ['Ground'], baseLevel: 54, type: 'Electric' },
    { name: 'Regidrago', hp: 11500, weaknesses: ['Fairy', 'Ice', 'Dragon'], baseLevel: 54, type: 'Dragon' },
    { name: 'Kubfu', hp: 10000, weaknesses: ['Flying', 'Psychic', 'Fairy'], baseLevel: 50, type: 'Fighting' },
    { name: 'Calyrex', hp: 12500, weaknesses: ['Ghost', 'Dark', 'Bug', 'Fire', 'Ice', 'Flying', 'Poison'], baseLevel: 57, type: 'Psychic/Grass' },
    { name: 'Urshifu', hp: 11500, weaknesses: ['Flying', 'Fighting', 'Fairy'], baseLevel: 54, type: 'Fighting/Dark' },
    { name: 'Eternatus', hp: 14000, weaknesses: ['Psychic', 'Dragon', 'Ground', 'Ice'], baseLevel: 59, type: 'Poison/Dragon' },
    { name: 'Mewtwo-MegaX', hp: 15500, weaknesses: ['Ghost', 'Flying', 'Fairy'], baseLevel: 62, type: 'Psychic/Fighting' },
    { name: 'Mewtwo-MegaY', hp: 15500, weaknesses: ['Dark', 'Bug', 'Ghost'], baseLevel: 62, type: 'Psychic' },
    { name: 'Articuno-Galar', hp: 10500, weaknesses: ['Ghost', 'Dark', 'Rock', 'Electric', 'Ice'], baseLevel: 52, type: 'Psychic/Flying' },
    { name: 'Moltres-Galar', hp: 10500, weaknesses: ['Electric', 'Ice', 'Rock', 'Fairy'], baseLevel: 52, type: 'Dark/Flying' },
    { name: 'Zapdos-Galar', hp: 10500, weaknesses: ['Flying', 'Psychic', 'Fairy', 'Ice', 'Electric'], baseLevel: 52, type: 'Fighting/Flying' },
    { name: 'Latios-Mega', hp: 12000, weaknesses: ['Ice', 'Dragon', 'Bug', 'Fairy', 'Ghost', 'Dark'], baseLevel: 55, type: 'Dragon/Psychic' },
    { name: 'Latias-Mega', hp: 12000, weaknesses: ['Ice', 'Dragon', 'Bug', 'Fairy', 'Ghost', 'Dark'], baseLevel: 55, type: 'Dragon/Psychic' },
    { name: 'Groudon-Primal', hp: 14000, weaknesses: ['Water', 'Ground'], baseLevel: 60, type: 'Ground/Fire' },
    { name: 'Kyogre-Primal', hp: 14000, weaknesses: ['Grass', 'Electric'], baseLevel: 60, type: 'Water' },
    { name: 'Rayquaza-Mega', hp: 14500, weaknesses: ['Fairy', 'Dragon', 'Ice', 'Rock'], baseLevel: 61, type: 'Dragon/Flying' },
    { name: 'Dialga-Origin', hp: 14000, weaknesses: ['Fighting', 'Ground'], baseLevel: 60, type: 'Steel/Dragon' },
    { name: 'Palkia-Origin', hp: 14000, weaknesses: ['Fairy', 'Dragon'], baseLevel: 60, type: 'Water/Dragon' },
    { name: 'Giratina-Origin', hp: 13000, weaknesses: ['Fairy', 'Ice', 'Dragon', 'Ghost', 'Dark'], baseLevel: 58, type: 'Ghost/Dragon' },
    { name: 'Tornadus-Therian', hp: 11500, weaknesses: ['Electric', 'Ice', 'Rock'], baseLevel: 54, type: 'Flying' },
    { name: 'Thundurus-Therian', hp: 11500, weaknesses: ['Ice', 'Rock'], baseLevel: 54, type: 'Electric/Flying' },
    { name: 'Landorus-Therian', hp: 12000, weaknesses: ['Ice', 'Water'], baseLevel: 55, type: 'Ground/Flying' },
    { name: 'Kyurem-Black', hp: 13500, weaknesses: ['Fighting', 'Rock', 'Dragon', 'Fairy', 'Steel'], baseLevel: 59, type: 'Dragon/Ice' },
    { name: 'Kyurem-White', hp: 13500, weaknesses: ['Rock', 'Dragon', 'Fairy', 'Steel', 'Fighting'], baseLevel: 59, type: 'Dragon/Ice' },
    { name: 'Xerneas-Neutral', hp: 12500, weaknesses: ['Steel', 'Poison'], baseLevel: 57, type: 'Fairy' },
    { name: 'Zygarde-10%', hp: 11000, weaknesses: ['Ice', 'Dragon', 'Fairy'], baseLevel: 53, type: 'Dragon/Ground' },
    { name: 'Zygarde-Complete', hp: 14000, weaknesses: ['Ice', 'Dragon', 'Fairy'], baseLevel: 60, type: 'Dragon/Ground' },
    { name: 'Necrozma-Dawn-Wings', hp: 12500, weaknesses: ['Dark', 'Ghost'], baseLevel: 57, type: 'Psychic/Ghost' }

]

const RAID_STATES = {
    INACTIVE: 'inactive',
    ACTIVE: 'active',
    DEFEATED: 'defeated',
    CATCHABLE: 'catchable'
};

const MAX_CATCH_ATTEMPTS = 3;
const RAID_DURATION = 150000; // 2.5 minutes
const CATCH_PHASE_DURATION = 60000; // 1 minute
const RAID_INTERVAL = 30000; // 3 minutes
const ATTACK_COOLDOWN = 5000; // 5 seconds

let currentRaid = null;
let raidParticipants = {};
let raidState = RAID_STATES.INACTIVE;
let caughtUsers = new Set();
let userCooldowns = new Map();
let raidTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('raid')
        .setDescription('Participate in the current raid')
        .addSubcommand(subcommand =>
            subcommand
                .setName('attack')
                .setDescription('Attack the raid boss'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('catch')
                .setDescription('Attempt to catch the defeated raid boss')
                .addStringOption(option =>
                    option.setName('ball')
                        .setDescription('The type of ball to use')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Raid Ball', value: 'raidball' }
                        ))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'attack') {
            await handleAttack(interaction);
        } else if (subcommand === 'catch') {
            await handleCatch(interaction);
        }
    },

    startRaid,
    setClient: (discordClient) => { client = discordClient; },
    RAID_STATES,
    getRaidState: () => raidState,
    scheduleNextRaid
};

async function startRaid() {
    if (raidState !== RAID_STATES.INACTIVE) {
        console.log("Attempted to start a new raid while one is already active.");
        return;
    }

    currentRaid = { ...RAID_BOSSES[Math.floor(Math.random() * RAID_BOSSES.length)] };
    raidParticipants = {};
    raidState = RAID_STATES.ACTIVE;
    caughtUsers.clear();
    userCooldowns.clear();
    
    const allUserData = await getUserData();
    for (const userId in allUserData) {
        allUserData[userId].raidCatchAttempts = 0;
        await updateUserData(userId, allUserData[userId]);
    }
    
    console.log(`New raid started: ${currentRaid.name}`);
    
    const channel = client.channels.cache.get("1243828341673295929");
    if (channel) {
        const spriteUrl = getPokemonGifUrl(currentRaid.name, false);
        
        const embed = new EmbedBuilder()
            .setTitle(`New Raid: ${currentRaid.name}`)
            .setDescription(`A new raid has started! The boss is ${currentRaid.name}. Use /raid attack to join the battle!`)
            .setImage(spriteUrl)
            .addFields(
                { name: 'Type', value: currentRaid.type },
                { name: 'HP', value: currentRaid.hp.toString() },
                { name: 'Base Level', value: currentRaid.baseLevel.toString() },
                { name: 'Weaknesses', value: currentRaid.weaknesses.join(', ') }
            );

        await channel.send({ embeds: [embed] });
    } else {
        console.error("Raid announcement channel not found!");
    }

    raidTimeout = setTimeout(() => {
        if (raidState === RAID_STATES.ACTIVE) {
            console.log(`Raid ${currentRaid.name} timed out after ${RAID_DURATION}ms`);
            endRaid(null, true);
        }
    }, RAID_DURATION);
}

async function handleAttack(interaction) {
    if (raidState !== RAID_STATES.ACTIVE) {
        return interaction.reply('There is no active raid at the moment. Please wait for the next one to start!');
    }

    const now = Date.now();
    const cooldownTime = userCooldowns.get(interaction.user.id);
    if (cooldownTime && now < cooldownTime) {
        const remainingCooldown = Math.ceil((cooldownTime - now) / 1000);
        return interaction.reply(`You need to wait ${remainingCooldown} seconds before attacking again.`);
    }

    const userData = await getUserData(interaction.user.id);
    if (!userData) {
        return interaction.reply('You need to start your journey first!');
    }

    const activePokemon = await getActivePokemon(userData);
    if (!activePokemon) {
        return interaction.reply('You need to select an active Pokémon first!');
    }

    let damage = activePokemon.level * 15;
    
    // Check for type effectiveness
    if (Array.isArray(activePokemon.type)) {
        // If the Pokemon has multiple types, check if any of them are effective
        const isEffective = activePokemon.type.some(type => currentRaid.weaknesses.includes(type));
        if (isEffective) {
            damage *= 2;
        }
    } else if (typeof activePokemon.type === 'string') {
        // If the Pokemon has a single type
        if (currentRaid.weaknesses.includes(activePokemon.type)) {
            damage *= 2;
        }
    }

    currentRaid.hp -= damage;
    raidParticipants[interaction.user.id] = (raidParticipants[interaction.user.id] || 0) + damage;

    userCooldowns.set(interaction.user.id, now + ATTACK_COOLDOWN);
    const battleImage = 'battle.png';

    if (currentRaid.hp <= 0) {
        await endRaid(interaction);
    } else {
        const embed = new EmbedBuilder()
            .setTitle(` ⚔️ Raid Battle: ${currentRaid.name} ⚔️ `)
            .setDescription(`${interaction.user.username} dealt ${damage} damage 💥!`)
            .addFields(
                { name: 'Raid Boss HP', value: `${currentRaid.hp}/${RAID_BOSSES.find(boss => boss.name === currentRaid.name).hp}` },
                { name: 'Your Pokémon', value: `${activePokemon.name} (Level ${activePokemon.level})` },
                { name: 'Type', value: Array.isArray(activePokemon.type) ? activePokemon.type.join('/') : activePokemon.type }
            )
            .setImage('attachment://battle.png');

        await interaction.reply({ 
            embeds: [embed],
            files: [{ attachment: battleImage, name: 'battle.png' }]
        });
    }
}

async function handleCatch(interaction) {
    if (raidState !== RAID_STATES.CATCHABLE) {
        return interaction.reply('There is no defeated raid boss to catch right now.');
    }

    const userData = await getUserData(interaction.user.id);
    if (!userData) {
        return interaction.reply('You need to start your journey first!');
    }

    if (!raidParticipants.hasOwnProperty(interaction.user.id)) {
        return interaction.reply('You did not participate in this raid and cannot attempt to catch the boss.');
    }

    if (caughtUsers.has(interaction.user.id)) {
        return interaction.reply('You have already caught <:RaidBall:1262812991586435203> this raid boss. Wait for the next raid.');
    }

    if (!userData.raidCatchAttempts) {
        userData.raidCatchAttempts = 0;
    }

    if (userData.raidCatchAttempts >= MAX_CATCH_ATTEMPTS) {
        return interaction.reply('You have used all your catch attempts for this raid boss.');
    }

    const ballType = interaction.options.getString('ball');
    if (ballType !== 'raidball') {
        return interaction.reply('You can only use a Raid Ball to catch raid bosses <:RaidBall:1262812991586435203> .');
    }

    if (!userData.items || !userData.items.raidball || userData.items.raidball <= 0) {
        return interaction.reply('You don\'t have any Raid Balls left <:RaidBall:1262812991586435203> .');
    }

    userData.raidCatchAttempts++;
    userData.items.raidball--;

    const caught = Math.random() < 0.5;

    if (caught) {
        const rarity = getRaidPokemonRarity();
        const shiny = Math.random() < 0.01;

        const level = Math.floor(20);

        const caughtPokemon = {
            name: currentRaid.name,
            level: level,
            rarity: rarity,
            isShiny: shiny,
            moves: ['Tackle'],
            exp: 0,
            type: currentRaid.type
        };

        userData.pokemon.push(caughtPokemon);
        caughtUsers.add(interaction.user.id);

        await updateUserData(interaction.user.id, userData);

        const embed = new EmbedBuilder()
            .setTitle('Raid Boss Caught!')
            .setDescription(`Congratulations! You caught the raid boss ${currentRaid.name} <:RaidBall:1262812991586435203> !`)
            .addFields(
                { name: 'Level', value: level.toString() },
                { name: 'Rarity', value: rarity },
                { name: 'Shiny', value: shiny ? 'Yes' : 'No' },
                { name: 'Added to Box', value: 'The Pokémon has been added to your box 📥.' }
            )
            .setImage(getPokemonGifUrl(currentRaid.name, shiny));

        await interaction.reply({ embeds: [embed] });
    } else {
        const attemptsLeft = MAX_CATCH_ATTEMPTS - userData.raidCatchAttempts;
        await interaction.reply(`The ${currentRaid.name} broke free! You have ${attemptsLeft} attempt(s) left.`);
    }

    await updateUserData(interaction.user.id, userData);
}

async function endRaid(interaction, timeout = false) {
    console.log(`Ending raid: ${currentRaid.name}, Timeout: ${timeout}, Current state: ${raidState}`);

    clearTimeout(raidTimeout);

    if (raidState !== RAID_STATES.ACTIVE && raidState !== RAID_STATES.DEFEATED) {
        console.log(`Attempted to end raid in invalid state: ${raidState}`);
        return;
    }

    raidState = timeout ? RAID_STATES.INACTIVE : RAID_STATES.DEFEATED;

    const embed = new EmbedBuilder()
        .setTitle(`Raid ${timeout ? 'Timed Out ⏰' : 'Defeated'}: ${currentRaid.name}`)
        .setDescription(timeout ? 
            'The raid has timed out. Better luck next time!' : 
            'The raid boss has been defeated! Use `/raid catch` to attempt catching it <:RaidBall:1262812991586435203> !');

    if (!timeout) {
        for (const [userId, damage] of Object.entries(raidParticipants)) {
            const userData = await getUserData(userId);
            const expGained = Math.floor(damage / 10);
            const coinsGained = Math.floor(damage * 5);

            userData.exp = (userData.exp || 0) + expGained;
            userData.money = (userData.money || 0) + coinsGained;
            
            userData.raidCatchAttempts = 0;
            userData.items = userData.items || {};
            userData.items.raidball = (userData.items.raidball || 0) + 3;

            await updateUserData(userId, userData);

            embed.addFields({ name: `${client.users.cache.get(userId)?.username || 'Unknown User'}`, value: `Damage: ${damage}, EXP: ${expGained}, Coins: ${coinsGained}, Raid Balls: 3` });
        }
    }

    const channel = client.channels.cache.get("1243828341673295929");
    if (channel) {
        await channel.send({ embeds: [embed] });
    }

    if (!timeout) {
        raidState = RAID_STATES.CATCHABLE;
        setTimeout(() => {
            if (raidState === RAID_STATES.CATCHABLE) {
                raidState = RAID_STATES.INACTIVE;
                channel.send('The raid boss has fled. The raid is now over.');
            }
        }, CATCH_PHASE_DURATION);
    }

    scheduleNextRaid();
}

function scheduleNextRaid() {
    setTimeout(() => {
        if (raidState === RAID_STATES.INACTIVE) {
            startRaid();
        } else {
            console.log('Attempted to start a new raid while one is still active. Skipping this cycle.');
            scheduleNextRaid();
        }
    }, RAID_INTERVAL);
}

function getPokemonGifUrl(pokemonName, isShiny) {
    const baseUrl = 'https://play.pokemonshowdown.com/sprites/ani';
    const shinyPrefix = isShiny ? '-shiny' : '';
    return `${baseUrl}${shinyPrefix}/${pokemonName.toLowerCase().replace(/[^a-z0-9]/g, '')}.gif`;
}