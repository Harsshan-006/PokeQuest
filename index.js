const fs = require('fs');
const fspromises = require('fs').promises;
const path = require('path');
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const { TOKEN, CLIENT_ID, GUILD_ID } = require('./config.json');
const raidModule = require('./commands/raid.js');
const helpers = require('./utils/helpers');
const { startRaid, setClient } = require('./commands/raid');

global.activeTradeOffers = [];
const USER_DATA_DIR = path.join(__dirname, '..', 'data', 'users');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  console.log(`Loading command file: ${file}`);
  try {
    const command = require(`./commands/${file}`);
    console.log('Loaded command:', command);
    if (command.data && command.data.name) {
      client.commands.set(command.data.name, command);
    } else {
      console.error(`Invalid command file structure: ${file}`);
    }
  } catch (error) {
    console.error(`Error loading command ${file}:`, error);
  }
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: client.commands.map(command => command.data.toJSON()),
    });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

// Load systems
const battle = require('./systems/battle.js');
const trade = require('./systems/trade.js');
const shop = require('./systems/shop.js');
const daily = require('./systems/daily-reward.js');
const { loadPokemonLists } = require('./utils/helpers.js');

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
  }
});

client.once('ready', () => {
  console.log('Bot is ready!');
  raidModule.setClient(client);
  raidModule.scheduleNextRaid(); // Start the raid scheduling
});

client.on('messageCreate', async message => {
  // You can add any message-based logic here if needed
  // For example, detecting messages from other bots
});

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

try {
  fs.mkdirSync(USER_DATA_DIR, { recursive: true });
  console.log('Users directory created or already exists');
} catch (error) {
  console.error('Error creating users directory:', error);
}

client.once('ready', async () => {
  console.log('Bot is ready!');
  await helpers.loadPokemonLists();
  // ... other startup code ...
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // Set the client for the raid module
  setClient(client);

  // Start the first raid immediately
  startRaid();

  // You might also want to schedule future raids here
  // For example:
  // scheduleNextRaid();
});

client.login(TOKEN);