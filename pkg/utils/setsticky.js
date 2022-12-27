const { getAnnounceChannelId, getStickyMessageId, listLoginMutexes, setStickyMessageId } = require("../redis/redis")

const buildStatusReportMessage = async () => {
  // 1. Obtain all existing mutex claims
  const mutexes = await listLoginMutexes();
  mutexes.sort((a, b) => a.timestamp - b.timestamp);

  // 1a. It can be empty
  if (mutexes.length === 0) return "No one is logged in!";

  // 2. Build Message
  let index;
  const message = [];

  // 2a. Self Logins
  index = 0;
  message.push("**Self Logins:**");
  mutexes.forEach(m => {
    if (m.account != m.pilot) return;

    index += 1;
    message.push(`\`${index}\`. <@!${m.account}> is around since <t:${m.timestamp}:R>`);
  });

  // 2b. Pilot Logins
  index = 0;
  message.push("");
  message.push("**Pilot Logins:**");
  mutexes.forEach(m => {
    if (m.account == m.pilot) return;

    index += 1;
    message.push(`\`${index}\`. <@!${m.account}> claimed by <@!${m.pilot}> <t:${m.timestamp}:R>`);
  });

  return message.join("\n");
}

const updateStickyMessage = async (client) => {
  const announceChannelId = await getAnnounceChannelId();
  const channel = await client.channels.fetch(announceChannelId);

  // 1. Build message
  const message = await buildStatusReportMessage();

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