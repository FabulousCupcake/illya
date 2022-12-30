const { getAnnounceChannelId, getStickyMessageId, listLoginMutexes, setStickyMessageId } = require("../redis/redis")

const HORIZONTAL_RULE = "~~‌                                                                                                      ‌~~";

const buildStatusReportMessage = async (interaction) => {
  // 1. Obtain all existing mutex claims
  const mutexes = await listLoginMutexes();

  // 1a. It can be empty
  if (mutexes.length === 0) return "No one is logged in!";

  // 1b. Enrich with nickname information
  const pilotIds = mutexes.map(m => m.pilot);
  await interaction.guild.members.fetch({ user: pilotIds });
  await Promise.all(mutexes.map(async (m) => {
    const user = await interaction.guild.members.fetch({ user: m.pilot });
    m.pilotNickname = user.displayName;
  }));

  // 1c. Sort
  mutexes.sort((a, b) => a.timestamp - b.timestamp);
  mutexes.sort((a, b) => a.pilotNickname.localeCompare(b.pilotNickname));

  // 2. Build Message
  let index;
  const message = [];
  const selfMutexes = mutexes.filter(m => m.account == m.pilot);
  const pilotMutexes = mutexes.filter(m => m.account != m.pilot);

  // 2a. Self Logins
  message.push("**🧑 People Around:**");

  if (selfMutexes.length === 0)  {
    message.push("No one!")
  } else {
    index = 0;
    selfMutexes.forEach(m => {
      index += 1;
      message.push(`\`${index}\`. <@!${m.account}> around since <t:${m.timestamp}:R>`);
    });
  }

  message.push("");

  // 2b. Pilot Logins
  message.push("**🧑‍✈️ Pilots Checked In:**");

  if (pilotMutexes.length === 0) {
    message.push("No one!");
  } else {
    index = 0;
    pilotMutexes.forEach(m => {
      index += 1;
      message.push(`\`${index}\`. <@!${m.pilot}> in <@!${m.account}> <t:${m.timestamp}:R>`);
    });
  }

  return message.join("\n");
}

const updateStickyMessage = async (interaction) => {
  const client = interaction.client;
  const announceChannelId = await getAnnounceChannelId();
  const channel = await client.channels.fetch(announceChannelId);

  // 1. Build message
  const message = [
    HORIZONTAL_RULE,
    await buildStatusReportMessage(interaction),
  ].join("\n");

  // 2. Delete previous
  try {
    const stickyMessageId = await getStickyMessageId();
    const stickyMessage = await channel.messages.fetch(stickyMessageId);
    if (stickyMessage) await stickyMessage.delete();
  } catch (err) {
    console.error("Failed deleting sticky message", err);
  }

  // 3. Post new
  const discordMessage = await channel.send({
    content: message,
    allowedMentions: {
      parse: [],
    }
  });

  // 4. Save ID for future removal
  await setStickyMessageId(discordMessage.id);
}

module.exports = {
  buildStatusReportMessage,
  updateStickyMessage,
}