const { SlashCommandBuilder } = require("@discordjs/builders");

const { deadSubCommand } = require("./dead.js");
const { pausedSubCommand } = require("./paused.js");
const { resolvedSubCommand } = require("./resolved.js");

const iamCommand = new SlashCommandBuilder()
  .setName("iam")
  .setDescription("Update my hit status")
  .setDefaultPermission(false)
  .addSubcommand(deadSubCommand)
  .addSubcommand(pausedSubCommand)
  .addSubcommand(resolvedSubCommand)

module.exports = {
  iamCommand,
};