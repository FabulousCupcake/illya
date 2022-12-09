const { Collection } = require('discord.js');

const { command: superSubcommand, commandFnMap: superFnMap } = require("./super/index.js");
const { command: accessSubcommand, commandFnMap: accessFnMap } = require("./access/index.js");
const {
  command: rootCommand,
  commandFnMap: rootFnMap,
  loginAliasCommand,
  logoutAliasCommand,
  statusAliasCommand,
  loginCommandFn,
  logoutCommandFn,
  statusCommandFn,
} = require("./general/index.js");

const command = rootCommand
  .addSubcommandGroup(superSubcommand)
  .addSubcommandGroup(accessSubcommand)

// Functions
const initializeCommands = client => {
  client.commands = new Collection();

  // Consumes a fnMap and optionally a subcommand prefix
  //   and registers it to the collection
  const registerCommands = (fnMap, subcommandGroupName) => {
    for (const name in fnMap) {
      const fn = fnMap[name];
      const fullName = ["illya", subcommandGroupName, name].join(" ").trim();

      client.commands.set(fullName, fn);
    }
  }

  // Register /illya commands
  registerCommands(rootFnMap, "");
  registerCommands(superFnMap, "super");
  registerCommands(accessFnMap, "access");

  // Register alias commands
  client.commands.set(loginAliasCommand.name, loginCommandFn);
  client.commands.set(logoutAliasCommand.name, logoutCommandFn);
  client.commands.set(statusAliasCommand.name, statusCommandFn);
}

module.exports = {
  command,
  initializeCommands,
}