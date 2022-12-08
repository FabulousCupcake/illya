const { SlashCommandSubcommandBuilder } = require("@discordjs/builders");

const { isCalledByOwner, isCalledByClanMember, isCalledByClanAdmin, isCalledByPilot, targetIsCaller } = require("../../acl/acl.js");
const { vanillaMembersRoleId } = require("../../config/config.js");
const { addLoginMutex, getPassword } = require("../../redis/redis.js");

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

  // Retrieve password
  const password = await getPassword(accountDiscordId);
  const passwordText = (password) ?
    `||\`${password}\`||` :
    "No password set!";

  // Send message/announce
  await interaction.followUp({
    content: `:inbox_tray: <@!${pilotDiscordId}> is going into <@!${accountDiscordId}>!`,
    ephemeral: false,
  });

  // Send password
  await interaction.followUp({
    content: `Account Link Password for <@!${accountDiscordId}>: ${passwordText}`,
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