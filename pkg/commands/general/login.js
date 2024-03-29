const { SlashCommandSubcommandBuilder } = require("@discordjs/builders");

const { isCalledByOwner, isCalledByPilot, targetIsCaller } = require("../../acl/acl.js");
const { vanillaMembersRoleId } = require("../../config/config.js");
const { addLoginMutex, getPassword, getGameAccountId, listLoginMutexes, getAnnounceChannelId } = require("../../redis/redis.js");
const { numberToEmoji } = require("../../utils/numbertoemoji.js");
const { updateStickyMessage } = require("../../utils/setsticky.js");

const SELF_LOGIN_EMOJI = "🟢";
const PILOT_LOGIN_EMOJI = "🟠";

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
  const pilotDiscordId = interaction.member.user.id;

  // Fetch clanmembers list
  if (!interaction.guild) await interaction.client.guilds.fetch(interaction.guildId);
  const allMembers = await interaction.guild.members.fetch();
  const clanMembers = allMembers.filter(m => m.roles.cache.has(vanillaMembersRoleId));

  // Abort if target is not clan member
  if (!clanMembers.find(m => m.id === accountDiscordId)) {
    interaction.followUp({
      content: `<@!${accountDiscordId}> is not a Vanilla clan member! Aborting!`,
      ephemeral: true,
    });
    console.warn("Failed login. Attempt to login into non-clan member");
    return;
  }

  // Try claim login mutex
  const result = await addLoginMutex(accountDiscordId, pilotDiscordId);
  if (!result) {
    interaction.followUp({
      content: `Someone is already logged into <@!${accountDiscordId}>'s account!`,
      ephemeral: true,
    });
    console.warn("Failed login. Mutex claim fail");
    return;
  }

  // Build message
  // 1. Retrieve mutex count
  const loginMutexes = await listLoginMutexes();
  const pilotLoginMutexCount = loginMutexes.filter(lm => lm.account != lm.pilot).length;
  const pilotLoginMutexCountText = numberToEmoji(pilotLoginMutexCount);

  // 2. Retrieve userid
  const gameAccountId = await getGameAccountId(accountDiscordId);
  const gameAccountIdText = (gameAccountId) ?
    `\`${gameAccountId}\`` :
    `No game account id set.`;

  // 3. Retrieve password
  const password = await getPassword(accountDiscordId);
  const passwordText = (password) ?
    `||\`${password}\`||` :
    "No password set!";

  // 4. Send message/announce
  const announceChannelId = await getAnnounceChannelId();
  const announceChannel = await interaction.client.channels.fetch(announceChannelId);
  const announceMessage = (pilotDiscordId == accountDiscordId) ?
    `${SELF_LOGIN_EMOJI} <@!${pilotDiscordId}> is around!` :
    `${PILOT_LOGIN_EMOJI} ${pilotLoginMutexCountText} <@!${pilotDiscordId}> in <@!${accountDiscordId}>!`;
  await announceChannel.send({
    content: announceMessage,
    allowedMentions: {
      users: [accountDiscordId],
    }
  });

  // 5. Update Sticky
  await updateStickyMessage(interaction);

  // Send password
  await interaction.followUp({
    content: `Account Credentials for <@!${accountDiscordId}>: ${gameAccountIdText} / ${passwordText}`,
    ephemeral: true,
  });
}

const subcommand = new SlashCommandSubcommandBuilder()
  .setName("login")
  .setDescription("Log in on someone and obtain their link password")
  .addUserOption(option =>
    option
    .setName("account")
    .setDescription("The discord user whose account is to be used. Uses yours if omitted")
    .setRequired(false))

module.exports = {
  subcommand,
  subcommandFn,
}