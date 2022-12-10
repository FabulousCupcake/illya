const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const { loginAliasCommand, logoutAliasCommand, statusAliasCommand } = require("../pkg/commands/general/index.js");

const { command } = require("../pkg/commands/index.js");

// Constants
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

// Globals
const rest = new REST({ version: '10' }).setToken(TOKEN);

// registerCommands registers command json and returns command id
const registerCommands = async () => {
  const payload = [
    command.toJSON(),
    loginAliasCommand.toJSON(),
    logoutAliasCommand.toJSON(),
    statusAliasCommand.toJSON(),
  ];

  console.log("==> Command JSON:");
  console.log(JSON.stringify(payload, null, 2));

  console.log('==> Registering slash commands...');
  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: payload },
  );

  console.log('==> Successfully registered slash commands!');
};


// Main
(async () => {
  // Register Commands
  try {
    await registerCommands();
  } catch (error) {
    console.error(error);
    throw error;
  }
})();
