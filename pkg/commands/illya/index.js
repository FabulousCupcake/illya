const { SlashCommandBuilder } = require("@discordjs/builders");

const { canhitSubCommand } = require("./canhit.js");
const { removeSubCommand } = require("./remove.js");
const { statusSubCommand } = require("./status.js");
const { updateSubCommand } = require("./update.js");

const illyaCommand = new SlashCommandBuilder()
  .setName("illya")
  .setDescription("PCRD Hit Coordination Helper Bot")
  .setDefaultPermission(false)
  .addSubcommand(canhitSubCommand)
  .addSubcommand(removeSubCommand)
  .addSubcommand(statusSubCommand)
  .addSubcommand(updateSubCommand)

module.exports = {
  illyaCommand,
}