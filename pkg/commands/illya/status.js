const { SlashCommandSubcommandBuilder } = require("@discordjs/builders");

const { isCalledByOwner, isCalledByClanMember, determineClanConfig } = require("saren/pkg/acl/acl.js");
const { readSheet } = require("../../sheets/sheets.js");

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

const statusFunc = async (interaction) => {
  const { allowed, reason } = await checkPermissions(interaction);
  if (!allowed) return interaction.followUp({
    content: reason,
    ephemeral: true,
  });

  // Resolve clan name
  console.log(interaction.member);
  if (!interaction.member) {
    console.log("wtf?");
  }
  const config = determineClanConfig(interaction.member);

  // Obtain and parse list of users in the string message
  const data = await readSheet(config.name);
  console.log(data);

  // Send message
  interaction.followUp({
    content: `TBA done executing status`,
    ephemeral: true,
  });
}

const statusSubCommand = new SlashCommandSubcommandBuilder()
  .setName("status")
  .setDescription("Prints current hits status")

module.exports = {
  statusFunc,
  statusSubCommand,
}