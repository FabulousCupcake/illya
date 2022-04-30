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

const canhitFunc = async (interaction) => {
  const { allowed, reason } = await checkPermissions(interaction);
  if (!allowed) return interaction.followUp({
    content: reason,
    ephemeral: true,
  });

  // Is it a delete operation?
  const isDeleteOperation = interaction.options.getBoolean("remove") || false;

  // Obtain and parse list of users in the string message
  const users = interaction.options.getUser("users");

  console.log(users);

  // Send message
  interaction.followUp({
    content: `TBA Done executing canhit`,
    ephemeral: true,
  });
}

const canhitSubCommand = new SlashCommandSubcommandBuilder()
  .setName("canhit")
  .setDescription("Add or remove accounts that can currently hit")
  .addBooleanOption(option =>
    option
    .setName("remove")
    .setDescription("Removes instead adding if set to true"))
  .addStringOption(option =>
    option
    .setName("users")
    .setDescription("List of discord tags of people whose account can hit")
    .setRequired(true))

module.exports = {
  canhitFunc,
  canhitSubCommand,
}