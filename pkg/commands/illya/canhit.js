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
    allowed: false,
    reason: "You are not allowed to do this!"
  }
};

const canhitFunc = async (interaction) => {
  const { allowed, reason } = await checkPermissions(interaction);
  if (!allowed) return interaction.followUp({
    content: reason,
    ephemeral: true,
  });

  // Resolve clan name
  const config = determineClanConfig(interaction.member);

  // Collect all info
  const remove = interaction.options.getBoolean("remove");
  const usersText = interaction.options.getString("users");
  console.log(usersText);
  const users = [...usersText.matchAll(/\d+/g)].map(m => m[0]);
  console.log(users);

  // Edit avails list
  const data = await readSheet(config.name);

  // Remove? or add?
  let mutatedUsers = [];
  if (remove) {
    users.forEach(userId => {
      mutatedUsers.push(userId);
      data.avails = data.avails.filter(a => a.id != userId);
    });
  } else {
    users.forEach(async (userId) => {
      // Check if already in entries table
      const entryExists = !!data.entries.find(e => e.ownerId == userId);
      if (entryExists) return;

      mutatedUsers.push(userId);
      data.avails.push({
        id: userId,
        name: await interaction.guild.members.fetch(userId).user.username,
      });
    });
  }

  // Write to sheet
  await writeSheet(config.name, data);

  // Send message
  const verb = (removed) ? "Removed" : "Added";
  const usersMessage = mutatedUsers.map(id => `<@!${id}>`).join(" ");
  interaction.followUp({
    content: `${verb} ${usersMessage} from Available accounts list`,
    ephemeral: true,
  });
}

const canhitSubCommand = new SlashCommandSubcommandBuilder()
  .setName("canhit")
  .setDescription("Add or remove accounts that can currently hit")
  .addStringOption(option =>
    option
    .setName("users")
    .setDescription("List of discord tags of people whose account can hit")
    .setRequired(true))
  .addBooleanOption(option =>
    option
    .setName("remove")
    .setDescription("Removes instead adding if set to true"))

module.exports = {
  canhitFunc,
  canhitSubCommand,
}