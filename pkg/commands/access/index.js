const { SlashCommandSubcommandGroupBuilder } = require("@discordjs/builders");

const { subcommand: add, subcommandFn: addFn } = require("./add.js");
const { subcommand: list, subcommandFn: listFn } = require("./list.js");
const { subcommand: remove, subcommandFn: removeFn } = require("./remove.js");

const command = new SlashCommandSubcommandGroupBuilder()
  .setName("access")
  .setDescription("Manage access to the bot")
  .addSubcommand(add)
  .addSubcommand(list)
  .addSubcommand(remove)

const commandFnMap = {
  "add": addFn,
  "list": listFn,
  "remove": removeFn,
}

module.exports = {
  command,
  commandFnMap,
}