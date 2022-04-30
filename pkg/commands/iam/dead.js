const { SlashCommandSubcommandBuilder } = require("@discordjs/builders");

const { isCalledByOwner, isCalledByClanMember } = require("saren/pkg/acl/acl.js");

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

const deadFunc = async (interaction) => {
  const { allowed, reason } = await checkPermissions(interaction);
  if (!allowed) return interaction.followUp({
    content: reason,
    ephemeral: true,
  });

  // Is it a delete operation?
  const isDeleteOperation = interaction.options.getBoolean("remove") || false;

  // Obtain and parse list of users in the string message
  const account = interaction.options.getUser("account");
  const timeline = interaction.options.getString("timeline");
  const damage = interaction.options.getInteger("damage");

  // Send message
  interaction.followUp({
    content: `TBA Done executing dead`,
    ephemeral: true,
  });
}

const deadSubCommand = new SlashCommandSubcommandBuilder()
  .setName("dead")
  .setDescription("Update my hit status as dead")
    .addUserOption(option =>
      option
      .setName("account")
      .setDescription("Whose account are you hitting with?"))
      .setRequired(true)
    .addStringOption(option =>
      option
      .setName("timeline")
      .setDescription("Timeline code of the hit"))
      .setRequired(true)
    .addIntegerOption(option =>
      option
      .setName("damage")
      .setDescription("Estimated minimum damage of the hit"))
      .setRequired(true)

module.exports = {
  deadFunc,
  deadSubCommand,
}