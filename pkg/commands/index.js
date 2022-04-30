const { Collection } = require('discord.js');

// illya
const { canhitFunc } = require("./illya/canhit.js");
// const { helpFunc } = require("./illya/help.js");
const { removeFunc } = require("./illya/remove.js");
// const { resetFunc } = require("./illya/reset.js");
const { statusFunc } = require("./illya/status.js");
const { updateFunc } = require("./illya/update.js");

// iam
const { deadFunc } = require("./iam/dead.js");
const { pausedFunc } = require("./iam/paused.js");
const { resolvedFunc } = require("./iam/resolved.js");
const { clashingFunc } = require("./iam/clashing.js");


const initializeCommands = client => {
  client.commands = new Collection();
  client.commands.set("canhit", canhitFunc);
  // client.commands.set("help", helpFunc);
  client.commands.set("remove", removeFunc);
  // client.commands.set("reset", resetFunc);
  client.commands.set("status", statusFunc);
  client.commands.set("update", updateFunc);

  client.commands.set("dead", deadFunc);
  client.commands.set("paused", pausedFunc);
  client.commands.set("resolved", resolvedFunc);
  client.commands.set("clashing", clashingFunc);
}

module.exports = {
  initializeCommands,
}