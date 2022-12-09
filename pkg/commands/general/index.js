const { SlashCommandBuilder } = require("@discordjs/builders");

const { subcommand: login, subcommandFn: loginFn } = require("./login.js");
const { subcommand: logout, subcommandFn: logoutFn } = require("./logout.js");
const { subcommand: setpassword, subcommandFn: setpasswordFn } = require("./setpassword.js");
const { subcommand: setaccountid, subcommandFn: setaccountidFn } = require("./setaccountid.js");
const { subcommand: status, subcommandFn: statusFn } = require("./status.js");

const command = new SlashCommandBuilder()
  .setName("illya")
  .setDescription("A Clan Battle Coordination Bot")
  .addSubcommand(login)
  .addSubcommand(logout)
  .addSubcommand(setpassword)
  .addSubcommand(setaccountid)
  .addSubcommand(status)

const commandFnMap = {
  "login": loginFn,
  "logout": logoutFn,
  "setpassword": setpasswordFn,
  "setaccountid": setaccountidFn,
  "status": statusFn,
}

module.exports = {
  command,
  commandFnMap,
}