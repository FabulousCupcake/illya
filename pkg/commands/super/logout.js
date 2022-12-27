const { SlashCommandSubcommandBuilder } = require("@discordjs/builders");

const { isCalledByOwner, isCalledByClanAdmin } = require("../../acl/acl.js");
const { checkLoginMutex, removeLoginMutex, listLoginMutexes, getAnnounceChannelId } = require("../../redis/redis.js");
const { numberToEmoji } = require("../../utils/numbertoemoji.js");
const { updateStickyMessage } = require("../../utils/setsticky.js");

const checkPermissions = async (interaction) => {
  if (isCalledByOwner(interaction)) {
    return {
      allowed: true,
      reason: "Caller is application owner",
    };
  }

  if (isCalledByClanAdmin(interaction)) {
    return {
      allowed: true,
      reason: "Caller is clan lead",
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

  const accountDiscordId = interaction.options.getUser("account")?.id || interaction.options.getUser("user").id;
  const callerDiscordId = interaction.options.getUser("user").id;

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

  // Retrieve mutex count
  const loginMutexes = await listLoginMutexes();
  const pilotLoginMutexCount = loginMutexes.filter(lm => lm.account != lm.pilot).length;
  const pilotLoginMutexCountText = numberToEmoji(pilotLoginMutexCount);

  // Send message/announce
  const announceChannelId = await getAnnounceChannelId();
  const announceChannel = await interaction.client.channels.fetch(announceChannelId);
  await announceChannel.send({
    content: `${pilotLoginMutexCountText} ⚫ <@!${pilotDiscordId}> out of <@!${accountDiscordId}>!`,
    ephemeral: false,
  });

  // Update Sticky
  await updateStickyMessage(interaction.client);

  // Simple followup
  await interaction.followUp({
    content: "Successfully logged out!",
    ephemeral: true,
  });
}

const subcommand = new SlashCommandSubcommandBuilder()
  .setName("logout")
  .setDescription("Logout on behalf of someone.")
  .addUserOption(option =>
    option
    .setName("user")
    .setDescription("The discord user you're logging out for / the pilot")
    .setRequired(true))
  .addUserOption(option =>
    option
    .setName("account")
    .setDescription("The discord user whose pricon account was used. Assumes the same user if omitted")
    .setRequired(false))

module.exports = {
  subcommand,
  subcommandFn,
}