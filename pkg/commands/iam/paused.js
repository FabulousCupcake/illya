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

const pausedFunc = async (interaction) => {
  const { allowed, reason } = await checkPermissions(interaction);
  if (!allowed) return interaction.followUp({
    content: reason,
    ephemeral: true,
  });

  // Resolve clan name
  const config = determineClanConfig(interaction.member);

  // Collect all info
  const hitter = interaction.user;
  const owner = interaction.options.getUser("account");
  const timeline = interaction.options.getString("timeline");
  const damage = interaction.options.getInteger("damage");

  // Try mutate
  let mutated = false;
  const data = await readSheet(config.name);
  data.entries = data.entries.map(e => {
    // e.ownerId may be omitted (i.e. hitter is owner)
    const ownerId = (e.ownerId) ? e.ownerId : e.hitterId;

    if (e.hitterId != hitter.id) return e;
    if (ownerId != owner.id) return e;

    mutated = true;
    return {
      ...e,
      timeline: (timeline) ? timeline : e.timeline,
      damage: (damage) ? damage : e.damage,
      status: "Paused",
    };
  });

  // Add new entry if we didn't mutate anything
  if (!mutated) {
    data.entries.push({
      hitterId: hitter.id,
      hitterName: hitter.username,
      ownerId: (owner.id == hitter.id) ? "" : owner.id,
      ownerName: (owner.name == hitter.name) ? "" : owner.name,
      timeline: timeline,
      damage: damage,
      status: "Paused",
    });
  }

  // Write to sheet
  await writeSheet(config.name, data);

  // Send message
  const verb = (mutated) ? "Updated" : "Added";
  interaction.followUp({
    content: `${verb} a hit by <@!${hitter.id}> (on <@!${owner.id}>)`,
    ephemeral: true,
  });
}

const pausedSubCommand = new SlashCommandSubcommandBuilder()
  .setName("paused")
  .setDescription("Update my hit status as paused")
    .addUserOption(option =>
      option
      .setName("account")
      .setDescription("Whose account are you hitting with?")
      .setRequired(true))
    .addStringOption(option =>
      option
      .setName("timeline")
      .setDescription("Timeline code of the hit")
      .setRequired(true))
    .addIntegerOption(option =>
      option
      .setName("damage")
      .setDescription("Estimated minimum damage of the hit")
      .setRequired(true))

module.exports = {
  pausedFunc,
  pausedSubCommand,
}