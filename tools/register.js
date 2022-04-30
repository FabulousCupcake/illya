const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const { clanConfigs, ownerDiscordId } = require("saren/pkg/config/config");

const { iamCommand } = require("../pkg/commands/iam.js");
const { illyaCommand } = require("../pkg/commands/illya");

// Constants
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

// Permissions
const PERMISSIONS = [
  {
    id: ownerDiscordId,
    type: 2,
    permission: true,
  },
  ...clanConfigs
  .filter(clan => clan.name === "Vanilla")
  .map(clan => ({
    id: clan.memberRoleId,
    type: 1,
    permission: true,
  })),
];

// Globals
const rest = new REST({ version: '9' }).setToken(TOKEN);

// registerCommands registers command json and returns command id
const registerCommands = async () => {
  const payload = [
    illyaCommand.toJSON(),
    iamCommand.toJSON(),
  ];

  console.log("==> Command JSON:");
  console.log(JSON.stringify(payload, null, 2));

  console.log('==> Registering slash commands...');
  const res = await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: payload },
  );
  console.log('==> Successfully registered slash commands!');

  return res[0].id;
};

// adjustPermissions sets command permission
const adjustPermissions = async (commandId) => {
  console.log("==> Permissions JSON:");
  console.log(JSON.stringify(PERMISSIONS, null, 2));

  console.log("==> Adjusting slash command permission");
  await rest.put(
    Routes.applicationCommandPermissions(CLIENT_ID, GUILD_ID, commandId),
    { body: { permissions: PERMISSIONS } },
  );
  console.log("==> Successfully adjusted slash command permissions!");
};

// Main
(async () => {
  // Register Commands
  try {
    const commandId = await registerCommands();
    await adjustPermissions(commandId);
  } catch (error) {
    console.error(error);
    throw error;
  }
})();