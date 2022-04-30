const { Collection } = require('discord.js');

// illya
const { canhitFunc } = require("./illya/canhit.js");
// const { helpFunc } = require("./illya/help.js");
// const { resetFunc } = require("./illya/reset.js");
const { statusFunc } = require("./illya/status.js");
// const { updateFunc } = require("./illya/update.js");

// iam
const { deadSubCommand } = require("./iam/dead.js");
const { pausedSubCommand } = require("./iam/paused.js");
const { resolvedSubCommand } = require("./iam/resolved.js");


const initializeCommands = client => {
  client.commands = new Collection();
  client.commands.set("canhit", canhitFunc);
  // client.commands.set("help", helpFunc);
  // client.commands.set("reset", resetFunc);
  client.commands.set("status", statusFunc);
  // client.commands.set("update", updateFunc);

  client.commands.set("dead", deadSubCommand);
  client.commands.set("paused", pausedSubCommand);
  client.commands.set("resolved", resolvedSubCommand);
}

module.exports = {
  initializeCommands,
}