const { SlashCommandSubcommandBuilder } = require("@discordjs/builders");

const { isCalledByOwner, isCalledByClanAdmin } = require("../../acl/acl.js");
const { vanillaMembersRoleId } = require("../../config/config.js");
const { addLoginMutex, getPassword, getGameAccountId, listLoginMutexes } = require("../../redis/redis.js");
const { numberToEmoji } = require("../../utils/numbertoemoji.js");

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
  const pilotDiscordId = interaction.options.getUser("user").id;

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
  const loginMutexCount = await listLoginMutexes().length;
  const loginMutexCountText = numberToEmoji(loginMutexCount);

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

  // Send message/announce
  await interaction.channel.send({
    content: `${loginMutexCountText} 🟠 <@!${pilotDiscordId}> is going into <@!${accountDiscordId}>!`,
  });

  // Send message
  await interaction.followUp({
    content: `Account Link Password for <@!${accountDiscordId}>: ${gameAccountIdText} / ${passwordText}`,
    ephemeral: true,
  });
}

const subcommand = new SlashCommandSubcommandBuilder()
  .setName("login")
  .setDescription("Login on behalf of someone.")
  .addUserOption(option =>
    option
    .setName("user")
    .setDescription("The discord user you're logging in for / the pilot")
    .setRequired(true))
  .addUserOption(option =>
    option
    .setName("account")
    .setDescription("The discord user whose pricon account will be used. Assumes the same user if omitted")
    .setRequired(false))

module.exports = {
  subcommand,
  subcommandFn,
}