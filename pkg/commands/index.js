const { Collection } = require('discord.js');

const { canhitFunc } = require("./illya/canhit.js");
// const { helpFunc } = require("./illya/help.js");
// const { resetFunc } = require("./illya/reset.js");
const { statusFunc } = require("./illya/status.js");
// const { updateFunc } = require("./illya/update.js");

const { iamFunc } = require ("./iam")

const initializeCommands = client => {
  client.commands = new Collection();
  client.commands.set("canhit", canhitFunc);
  // client.commands.set("help", helpFunc);
  // client.commands.set("reset", resetFunc);
  client.commands.set("status", statusFunc);
  // client.commands.set("update", updateFunc);

  client.commands.set("iam", iamFunc);
}

module.exports = {
  initializeCommands,
}