// BUILDER
const { SlashCommandBuilder } = require("@discordjs/builders");

const { isCalledByOwner, isCalledByClanMember } = require("saren/pkg/acl/acl.js");
// const { readSheet, writeSheet } = require("../../sheets/sheets.js");

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

  return {
    allowed: false,
    reason: "You are not allowed to do this!"
  }
};

const iamFunc = async (interaction) => {
  const { allowed, reason } = await checkPermissions(interaction);
  if (!allowed) return interaction.followUp({
    content: reason,
    ephemeral: true,
  });

  // Obtain and parse list of users in the string message
  console.log("Hello iam")

  // Send message
  interaction.followUp({
    content: `TBA iam`,
    ephemeral: true,
  });
}

const iamCommand = new SlashCommandBuilder()
  .setName("iam")
  .setDescription("Update your hit status")
  .setDefaultPermission(false)
  .addStringOption(option =>
    option
    .setName("status")
    .setDescription("Pick one of the status")
    .setRequired(true)
    .addChoice("dead", "dead")
    .addChoice("paused", "paused")
    .addChoice("resolved", "resolved"))
  .addIntegerOption(option =>
    option
    .setName("damage")
    .setDescription("Your estimated hit damage minimum"))
  .addUserOption(option =>
    option
    .setName("account")
    .setDescription("If not hitting with own account, write the discord user of the account you're hitting with here"))
  .addStringOption(option =>
    option
    .setName("timeline")
    .setDescription("Timeline code of the hit"))

module.exports = {
  iamFunc,
  iamCommand,
}