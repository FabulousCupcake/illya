const { Collection } = require('discord.js');

const { command: rootCommand, commandFnMap: rootFnMap } = require("./general/index.js");
const { command: superSubcommand, commandFnMap: superFnMap } = require("./super/index.js");
const { command: accessSubcommand, commandFnMap: accessFnMap } = require("./access/index.js");

const command = rootCommand
  .addSubcommandGroup(superSubcommand)
  .addSubcommandGroup(accessSubcommand)

// Functions
const initializeCommands = client => {
  client.commands = new Collection();

  // Consumes a fnMap and optionally a subcommand prefix
  //   and registers it to the collection
  const registerCommands = (fnMap, prefix) => {
    for (const name in fnMap) {
      const fn = fnMap[name];
      const fullName = [prefix, name].join(" ").trim();

      client.commands.set(fullName, fn);
    }
  }

  registerCommands(rootFnMap, "");
  registerCommands(superFnMap, "super");
  registerCommands(accessFnMap, "access");
}

module.exports = {
  command,
  initializeCommands,
}