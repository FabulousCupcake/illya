const { SlashCommandSubcommandBuilder } = require("@discordjs/builders");

const { isCalledByOwner, isCalledByClanMember } = require("../../acl/acl.js");
const { setGameAccountId } = require("../../redis/redis.js");

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

  // Get and sanitize account id
  const rawGameAccountId = interaction.options.getString("accountid");
  const gameAccountId = rawGameAccountId.replace(/[^\d]/g, "").trim().substr(0, 9);

  // Set game account id
  await setGameAccountId(interaction.member.id, gameAccountId);

  // Send message
  interaction.followUp({
    content: `Your ingame account id ${gameAccountId} has been successfully saved`,
    ephemeral: true,
  });
}

const subcommand = new SlashCommandSubcommandBuilder()
  .setName("setaccountid")
  .setDescription("Stores your 9-digit account id to IllyaBot")
  .addStringOption(option =>
    option
    .setName("accountid")
    .setDescription("Your 9-digit account id without spaces")
    .setRequired(true))

module.exports = {
  subcommand,
  subcommandFn,
}