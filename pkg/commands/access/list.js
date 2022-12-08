const { SlashCommandSubcommandBuilder } = require("@discordjs/builders");

const { isCalledByOwner, isCalledByClanMember, isCalledByClanAdmin } = require("../../acl/acl.js");
const { vanillaLeadsRoleId, vanillaMembersRoleId, vanillaFriendsRoleId } = require("../../config/config.js");
const { listPilots } = require("../../redis/redis.js");

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

const LEAD_EMOJI   = "🇱 ";
const MEMBER_EMOJI = "🇲";
const FRIEND_EMOJI = "🇫";
const SUS_EMOJI    = "🤨";
const EMPTY_EMOJI  = "▪️";

const subcommandFn = async (interaction) => {
  const { allowed, reason } = await checkPermissions(interaction);
  if (!allowed) return interaction.followUp({
    content: reason,
    ephemeral: true,
  });

  const pilotIds = await listPilots();

  // Fetch members
  if (!interaction.guild) await interaction.client.guilds.fetch({ guild: interaction.guildId, force: true });
  const pilots = await interaction.guild.members.fetch({ force: true, user: pilotIds });
  pilots.sort((a, b) => {
    const _a = a.nickname || a.user.username;
    const _b = b.nickname || b.user.username;
    return _a.localeCompare(_b);
  });

  // Prep message
  const message = [
    "_**Role indicators:** `L`ead, `M`ember, `F`riend_",
    ""
  ];

  // Build messages
  let index = 0;
  pilots.forEach(pilot => {
    index += 1;

    const isLeadEmoji = pilot.roles.cache.has(vanillaLeadsRoleId) ? LEAD_EMOJI : EMPTY_EMOJI;
    const isMemberEmoji = pilot.roles.cache.has(vanillaMembersRoleId) ? MEMBER_EMOJI : EMPTY_EMOJI;
    const isFriendEmoji = pilot.roles.cache.has(vanillaFriendsRoleId) ? FRIEND_EMOJI : EMPTY_EMOJI;
    const isSusEmoji = (
      isLeadEmoji === EMPTY_EMOJI &&
      isMemberEmoji === EMPTY_EMOJI &&
      isFriendEmoji === EMPTY_EMOJI
    ) ? SUS_EMOJI : EMPTY_EMOJI;

    const line = `\`${index}\`. ${isLeadEmoji}${isMemberEmoji}${isFriendEmoji}${isSusEmoji} <@!${pilot.id}>`;
    message.push(line);
  });

  // Send message
  interaction.followUp({
    content: message.join("\n"),
    ephemeral: true,
  });
}

const subcommand = new SlashCommandSubcommandBuilder()
  .setName("list")
  .setDescription("Displays the list of users who have access to the account link passwords")

module.exports = {
  subcommand,
  subcommandFn,
}