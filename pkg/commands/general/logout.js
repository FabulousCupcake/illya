const { SlashCommandSubcommandBuilder } = require("@discordjs/builders");

const { isCalledByOwner, targetIsCaller, isCalledByPilot } = require("../../acl/acl.js");
const { checkLoginMutex, removeLoginMutex } = require("../../redis/redis.js");

const checkPermissions = async (interaction) => {
  if (isCalledByOwner(interaction)) {
    return {
      allowed: true,
      reason: "Caller is application owner",
    };
  }

  if (await isCalledByPilot(interaction)) {
    return {
      allowed: true,
      reason: "Caller is in pilot user list"
    }
  }

  if (targetIsCaller(interaction, "account")) {
    return {
        allowed: true,
        reason: "Caller is the target / account owner",
    };
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

  const accountDiscordId = interaction.options.getUser("account")?.id || interaction.member.user.id;
  const callerDiscordId = interaction.member.user.id;

  // Drop if the caller is not the pilot logged in
  const { pilot: pilotDiscordId } = await checkLoginMutex(accountDiscordId);
  if (callerDiscordId != pilotDiscordId) {
    interaction.followUp({
      content: `Failed to logout! You're not logged in on <@!${accountDiscordId}>!`,
      ephemeral: true,
    });
    console.warn("Failed logout");
    return;
  }

  // Remove mutex claim
  await removeLoginMutex(accountDiscordId);

  // Send message/announce
  await interaction.channel.send({
    content: `:outbox_tray: <@!${pilotDiscordId}> is out from <@!${accountDiscordId}>!`,
  });

  // Simple followup
  await interaction.followUp({
    content: "Successfully logged out!",
    ephemeral: true,
  });
}

const subcommand = new SlashCommandSubcommandBuilder()
  .setName("logout")
  .setDescription("Log out on someone")
  .addUserOption(option =>
    option
    .setName("account")
    .setDescription("The discord user whose account was used. Uses yours if omitted")
    .setRequired(false))

module.exports = {
  subcommand,
  subcommandFn,
}