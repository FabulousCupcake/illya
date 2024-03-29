const { SlashCommandSubcommandBuilder } = require("@discordjs/builders");

const { isCalledByOwner, isCalledByClanAdmin } = require("../../acl/acl.js");
const { setGameAccountId } = require("../../redis/redis.js");

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

  // Get and sanitize account id
  const rawGameAccountId = interaction.options.getString("accountid");
  const gameAccountId = rawGameAccountId.replace(/[^\d]/g, "").trim().substr(0, 9);

  // Set game account id
  const userId = interaction.options.getUser("user").id;
  await setGameAccountId(userId, gameAccountId);

  // Send message
  interaction.followUp({
    content: `The ingame account id \`${gameAccountId}\` for <@!${userId}> has been successfully saved`,
    ephemeral: true,
  });
}

const subcommand = new SlashCommandSubcommandBuilder()
  .setName("setaccountid")
  .setDescription("Stores someone's 9-digit account id to IllyaBot")
  .addUserOption(option =>
    option
    .setName("user")
    .setDescription("The discord user you're setting their account id for")
    .setRequired(true))
  .addStringOption(option =>
    option
    .setName("accountid")
    .setDescription("The 9-digit account id without spaces")
    .setRequired(true))

module.exports = {
  subcommand,
  subcommandFn,
}