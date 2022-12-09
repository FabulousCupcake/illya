const { Client, ApplicationCommandOptionType, IntentsBitField, GatewayIntentBits } = require("discord.js");

const { Semaphore } = require("./pkg/utils/semaphore");
const { initializeRedisClient } = require("./pkg/redis/redis.js")
const { initializeCommands } = require("./pkg/commands");

const TOKEN = process.env.DISCORD_TOKEN;

const throttler = new Semaphore(1);
const client = new Client({
  intents: new IntentsBitField([
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ]),
});

const readyHandler = () => console.log(`Logged in as ${client.user.tag}!`);

const handler = async (interaction) => {
  const recognizedCommandsList = ["illya", "i", "il", "io"];

  // Respond only to slashcommand and certain command names
  if (!interaction.isChatInputCommand()) return;
  if (!recognizedCommandsList.contains(interaction.commandName)) return;

  // resolveCommandName resolves the command function from a given command name / string
  const resolveCommandFunc = () => {
    const command = interaction.commandName;
    const subcommand = interaction.options.getSubcommand();
    const subcommandGroup = interaction.options.getSubcommandGroup(false);
    const fullCommandName = [command, subcommandGroup, subcommand].join(" ").trim();

    // Try to resolve the command function using just command name
    const fn = client.commands.get(fullCommandName);
    if (fn) return fn;

    console.warn("Unknown command", fullCommandName)
    return false;
  }

  // Resolve command
  const commandFunc = resolveCommandFunc();
  if (!commandFunc) return;

  // Tell discord that we ACKed
  await interaction.deferReply({ ephemeral: true });

  // Log it
  (function() {
    const Y = f => (x => x(x))(y => f(x => y(y)(x)));
    const optionsToText = Y(optionsToTextFn => options => {
      if (!options) return "";
      const content = options.map(o => {
        // Recurse if subcommand
        if (
          o.type == ApplicationCommandOptionType.Subcommand ||
          o.type == ApplicationCommandOptionType.SubcommandGroup
        ) {
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
    await throttler.callFunction(commandFunc, interaction);
  } catch (err) {
    interaction.followUp({
      content: "Oops! Something went wrong!",
      ephemeral: true,
    });
    console.error(err, interaction);
  }
};

const main = async () => {
  initializeCommands(client);
  initializeRedisClient();

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
