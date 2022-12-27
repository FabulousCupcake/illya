const { SlashCommandSubcommandBuilder } = require("@discordjs/builders");

const { isCalledByOwner, isCalledByClanAdmin } = require("../../acl/acl.js");
const { setAnnounceChannelId } = require("../../redis/redis.js");

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

  // Save announce channel id to redis
  const channelId = interaction.channelId;
  await setAnnounceChannelId(channelId);
  console.info("Announce Channel set to", channelId);

  // Send message
  interaction.followUp({
    content: `Announce channel has been set to <#${channelId}>`,
    ephemeral: true,
  });
}

const subcommand = new SlashCommandSubcommandBuilder()
  .setName("setchannel")
  .setDescription("Mark the current channel as announce channel")

module.exports = {
  subcommand,
  subcommandFn,
}