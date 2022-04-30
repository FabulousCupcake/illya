const { Client, Intents } = require("discord.js");

const { initializeSpreadsheetClient } = require("./pkg/sheets/sheets.js");
const { initializeCommands } = require("./pkg/commands");

const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS] });

const readyHandler = () => console.log(`Logged in as ${client.user.tag}!`);

const handler = async (interaction) => {

  // Respond only to slashcommand and certain command names
  if (!interaction.isCommand()) return;
  if (
    interaction.commandName !== "illya" &&
    interaction.commandName !== "iam"
  ) {
    return;
  }

  // Try to resolve the command function using just command name
  let commandFunc = client.commands.get(interaction.commandName);

  // If not found, try with subcommand name
  if (!commandFunc) {
    const subcommandName = interaction.options.getSubcommand();
    commandFunc = client.commands.get(subcommandName);
  }

  // If still not found, bail out
  if (!commandFunc) {
    console.warn("Unknown command", subcommand, interaction);
    return;
  }

  // Tell discord that we ACKed
  await interaction.deferReply({ ephemeral: true });

  // Log it
  (function() {
    const Y = f => (x => x(x))(y => f(x => y(y)(x)));
    const optionsToText = Y(optionsToTextFn => options => {
      if (!options) return "";
      const content = options.map(o => {
        // Recurse if subcommand
        if (o.type == "SUB_COMMAND" || o.type == "SUB_COMMAND_GROUP") {
          const value = optionsToTextFn(o.options);
          return `${o.name}: ${value}`;
        }

        // Otherwise just return value
        return `${o.name}: ${o.value}`
      }).join(", ");

      return `[${content}]`;
    });

    const discordUserId = interaction.user.id;
    const discordUserTag = interaction.user.tag;
    const optionsText = optionsToText(interaction.options.data);

    console.info(`${discordUserId} (${discordUserTag}): ${optionsText}`);
  })();

  // Execute it
  try {
    await commandFunc(interaction);
  } catch (err) {
    interaction.followUp({
      content: "Oops! Something went wrong!",
      ephemeral: true,
    });
    console.error(err, interaction);
  }
};

const main = async () => {
  initializeSpreadsheetClient();
  initializeCommands(client);

  client.on("ready", readyHandler);
  client.on("interactionCreate", handler);
  client.login(TOKEN);
}

// Do not crash on error
process.on('uncaughtException', function (err) {
  console.log("!!!");
  console.error(err);
  console.log("---")
  console.error(err.stack);
  console.log("---")
});

main();
