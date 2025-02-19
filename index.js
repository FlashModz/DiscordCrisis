require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { showMenu } = require('./functions/menu');
const { initReadline } = require('./functions/utils');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildWebhooks,
  ]
});

const rl = initReadline();

client.once('ready', () => {
  console.log('Bot is ready!');
  showMenu(client, rl);
});

client.login(process.env.DISCORD_TOKEN);