const { SlashCommandSubcommandBuilder } = require("@discordjs/builders");

const { isCalledByOwner, isCalledByClanMember, determineClanConfig } = require("saren/pkg/acl/acl.js");
const { readSheet, writeSheet } = require("../../sheets/sheets.js");

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

const removeFunc = async (interaction) => {
  const { allowed, reason } = await checkPermissions(interaction);
  if (!allowed) return interaction.followUp({
    content: reason,
    ephemeral: true,
  });

  // Resolve clan name
  const config = determineClanConfig(interaction.member);

  // Collect all info
  const hitter = interaction.options.getUser("hitter");
  const owner = interaction.options.getUser("account");

  // Remove
  let mutated = false;
  const data = await readSheet(config.name);
  data.entries = data.entries.filter(e => {
    // e.ownerId may be omitted (i.e. hitter is owner)
    const ownerId = (e.ownerId) ? e.ownerId : e.hitterId;

    // Match; filter it out
    if (e.hitterId == hitter.id && ownerId == owner.id) {
      mutated = true;
      return false;
    }

    // Non-match, include
    return true
  });

  // Write to sheet
  await writeSheet(config.name, data);

  // Send message
  const verb = (mutated) ? "Successfully" : "Failed";
  interaction.followUp({
    content: `${verb} removing a hit by <@!${hitter.id}> on <@!${owner.id}>`,
    ephemeral: true,
  });
}

const removeSubCommand = new SlashCommandSubcommandBuilder()
  .setName("remove")
  .setDescription("Remove a hit entry")
  .addUserOption(option =>
    option
    .setName("hitter")
    .setDescription("Who is doing the hit?")
    .setRequired(true))
  .addUserOption(option =>
    option
    .setName("account")
    .setDescription("Whose account are they hitting with?")
    .setRequired(true))

module.exports = {
  removeFunc,
  removeSubCommand,
}