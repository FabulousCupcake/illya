const { SlashCommandSubcommandBuilder } = require("@discordjs/builders");

const { isCalledByOwner, isCalledByClanMember, determineClanConfig } = require("saren/pkg/acl/acl.js");
const { readSheet, writeSheet } = require("../../sheets/sheets.js");

const checkPermissions = async (interaction) => {
  if (isCalledByOwner(interaction)) {
    return {
      allowed: true,
      reason: "Caller is application owner",
    };
  }

  if (!isCalledByClanMember(interaction)) {
    return {
      allowed: false,
      reason: "Unable to determine which clan you belong to!",
    };
  }

  if (!isCalledByClanAdmin(interaction)) {
    return {
      allowed: false,
      reason: "You're not a clan lead!",
    };
  }

  return {
    allowed: true,
    reason: "You are not allowed to do this!"
  }
};

const resetFunc = async (interaction) => {
  const { allowed, reason } = await checkPermissions(interaction);
  if (!allowed) return interaction.followUp({
    content: reason,
    ephemeral: true,
  });

  // Resolve clan name
  const config = determineClanConfig(interaction.member);

  // Collect all info
  const hitter = interaction.options.getUser("hitter");
  const owner = interaction.options.getUser("account");

  // Reset
  const data = await readSheet(config.name);
  data.entries = [];
  data.avails = [];

  // Write to sheet
  await writeSheet(config.name, data);

  // Send message
  interaction.followUp({
    content: `Hit entries and availability list reset`,
    ephemeral: true,
  });
}

const resetSubCommand = new SlashCommandSubcommandBuilder()
  .setName("reset")
  .setDescription("Reset the entire hit entries and availability list")

module.exports = {
  resetFunc,
  resetSubCommand,
}