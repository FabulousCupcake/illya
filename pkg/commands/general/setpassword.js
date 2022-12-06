const { SlashCommandSubcommandBuilder } = require("@discordjs/builders");

const { isCalledByOwner, isCalledByClanMember, isCalledByClanAdmin } = require("../../acl/acl.js");
const { setPassword } = require("../../redis/redis.js");

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
  await setPassword(interaction.member.id, password);

  // Send message
  interaction.followUp({
    content: "Password has been successfully stored",
    ephemeral: true,
  });
}

const subcommand = new SlashCommandSubcommandBuilder()
  .setName("setpassword")
  .setDescription("Stores your account link password to IllyaBot.")
  .addStringOption(option =>
    option
    .setName("password")
    .setDescription("Your link account password")
    .setRequired(true))

module.exports = {
  subcommand,
  subcommandFn,
}