const { SlashCommandSubcommandBuilder } = require("@discordjs/builders");

const { isCalledByOwner, isCalledByClanMember, determineClanConfig } = require("saren/pkg/acl/acl.js");
const { readSheet } = require("../../sheets/sheets.js");

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
    allowed: false,
    reason: "You are not allowed to do this!"
  }
};

const buildMessage = data => {
  const lines = [];
  const bossName = data.bossName.match(/([\w\s]+)/)[0].trim(); // Remove emojis
  lines.push(`**${data.position} • ${bossName}**`);

  const buildHitLine = (hit, icon) => {
    const message = [];
    // const hitter = await interaction.users.fetch(hit.hitterId);
    // const owner = await interaction.users.fetch(hit.ownerId);

    message.push(icon)
    message.push(hit.damage.toLocaleString());
    message.push("•");
    message.push(hit.timeline);
    message.push(`<@!${hit.hitterId}>`);
    if (hit.ownerId && (hit.hitterId != hit.ownerId)) {
      message.push(`(on <@!${hit.ownerId}>)`);
    }

    return message.filter(Boolean).join(" ");
  };

  // Add resolved hits
  const resolvedHits = data.entries.filter(e => e.status === "Resolved");
  if (resolvedHits.length <= 0) lines.push("No resolved hits yet");
  resolvedHits.map(h => buildHitLine(h, "✅")).forEach(l => lines.push(l));
  lines.push("");

  // Add remaining HP
  lines.push(`**Remaining:** ${data.bossHp.toLocaleString()}`);

  // Add paused hits
  const pausedHits = data.entries.filter(e => e.status === "Paused");
  if (pausedHits.length <= 0) lines.push("No paused hits");
  pausedHits.map(h => buildHitLine(h, "⏸")).forEach(l => lines.push(l));
  lines.push("");

  // Add dead hits
  const deadHits = data.entries.filter(e => e.status === "Dead");
  if (deadHits.length > 0) lines.push("No dead hits");
  deadHits.map(h => buildHitLine(h, "💀")).forEach(l => lines.push(l));
  lines.push("");

  // Add available hits
  data.avails.forEach(a => {
    const message = `🆓 <@!${a.id}>`;
    lines.push(message);
  });

  return lines.join("\n");
};

const statusFunc = async (interaction) => {
  const { allowed, reason } = await checkPermissions(interaction);
  if (!allowed) return interaction.followUp({
    content: reason,
    ephemeral: true,
  });

  // Resolve clan name
  const config = determineClanConfig(interaction.member);

  // Obtain and parse list of users in the string message
  const data = await readSheet(config.name);
  console.log(data);

  // Build nice message
  const message = buildMessage(data);

  // Send message
  interaction.followUp({
    content: message,
    ephemeral: true,
  });
}

const statusSubCommand = new SlashCommandSubcommandBuilder()
  .setName("status")
  .setDescription("Prints current hits status")

module.exports = {
  statusFunc,
  statusSubCommand,
}