const { SlashCommandSubcommandBuilder } = require("@discordjs/builders");

const { isCalledByOwner, isCalledByClanMember, isCalledByPilot } = require("../../acl/acl.js");
const { buildStatusReportMessage } = require("../../utils/setsticky.js");

const checkPermissions = async (interaction) => {
  if (isCalledByOwner(interaction)) {
    return {
      allowed: true,
      reason: "Caller is application owner",
    };
  }

  if (isCalledByClanMember(interaction)) {
    return {
      allowed: true,
      reason: "Caller is a clan member",
    };
  }

  if (await isCalledByPilot(interaction)) {
    return {
      allowed: true,
      reason: "Caller is in pilot user list"
    }
  }

  return {
    allowed: false,
    reason: "You are not allowed to do this!"
  }
};

const subcommandFn = async (interaction) => {
  const { allowed, reason } = await checkPermissions(interaction);
  if (!allowed) return interaction.followUp({
    content: reason,
    ephemeral: true,
  });

  // Build message
  const message = await buildStatusReportMessage(interaction);

  // Send message
  interaction.followUp({
    content: message,
    ephemeral: true,
  });
}

const subcommand = new SlashCommandSubcommandBuilder()
  .setName("status")
  .setDescription("Displays the current pilot statuses of who's on whomst")

module.exports = {
  subcommand,
  subcommandFn,
}
