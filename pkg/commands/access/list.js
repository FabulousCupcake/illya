const { SlashCommandSubcommandBuilder } = require("@discordjs/builders");

const { isCalledByOwner, isCalledByClanMember, isCalledByClanAdmin } = require("../../acl/acl.js");

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

const subcommandFn = async (interaction) => {
  const { allowed, reason } = await checkPermissions(interaction);
  if (!allowed) return interaction.followUp({
    content: reason,
    ephemeral: true,
  });

  console.log("TODO: Implement")

  // Send message
  interaction.followUp({
    content: `Not Implemented`,
    ephemeral: true,
  });
}

const subcommand = new SlashCommandSubcommandBuilder()
  .setName("list")
  .setDescription("Displays the list of users who have access to the account link passwords.")

module.exports = {
  subcommand,
  subcommandFn,
}