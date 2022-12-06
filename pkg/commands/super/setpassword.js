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

  const targetUser = interaction.options.getUser("target");
  const password = interaction.options.getString("password");

  // Drop if too long
  if (password.length > 100) {
    interaction.followUp({
      content: "Too long. What are you trying to do?",
      ephemeral: true,
    });
    console.warn("Input string too long");
    return;
  }

  // Set password
  await setPassword(targetUser.id, password);

  // Send message
  interaction.followUp({
    content: `Password has been successfully stored for <@!${targetUser.id}>`,
    ephemeral: true,
  });
}

const subcommand = new SlashCommandSubcommandBuilder()
  .setName("setpassword")
  .setDescription("Stores account link password to IllyaBot on behalf of someone.")
  .addUserOption(option =>
    option
    .setName("user")
    .setDescription("The discord user you're setting the password for.")
    .setRequired(true))
  .addStringOption(option =>
    option
    .setName("password")
    .setDescription("The link account password")
    .setRequired(true))

module.exports = {
  subcommand,
  subcommandFn,
}