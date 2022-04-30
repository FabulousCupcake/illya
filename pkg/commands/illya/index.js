const { SlashCommandBuilder } = require("@discordjs/builders");

const { canhitSubCommand } = require("./canhit.js");
const { statusSubCommand } = require("./status.js");

const illyaCommand = new SlashCommandBuilder()
  .setName("illya")
  .setDescription("PCRD Hit Coordination Helper Bot")
  .setDefaultPermission(false)
  .addSubcommand(canhitSubCommand)
  .addSubcommand(statusSubCommand)

module.exports = {
  illyaCommand,
}