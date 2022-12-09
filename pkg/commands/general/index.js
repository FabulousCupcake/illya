const { SlashCommandBuilder } = require("@discordjs/builders");

const { subcommand: login, subcommandFn: loginFn } = require("./login.js");
const { subcommand: logout, subcommandFn: logoutFn } = require("./logout.js");
const { subcommand: setpassword, subcommandFn: setpasswordFn } = require("./setpassword.js");
const { subcommand: setaccountid, subcommandFn: setaccountidFn } = require("./setaccountid.js");
const { subcommand: status, subcommandFn: statusFn } = require("./status.js");

// Aliases
const aliasedLoginSubcommand = structuredClone(login).setName("il")
const aliasedLogoutSubcommand = structuredClone(logout).setName("io")
const aliasedStatusSubcommand = structuredClone(status).setName("i")

const command = new SlashCommandBuilder()
  .setName("illya")
  .setDescription("A Clan Battle Coordination Bot")
  .addSubcommand(login)
  .addSubcommand(logout)
  .addSubcommand(setpassword)
  .addSubcommand(setaccountid)
  .addSubcommand(status)
  .addSubcommand(aliasedLoginSubcommand)
  .addSubcommand(aliasedLogoutSubcommand)
  .addSubcommand(aliasedStatusSubcommand)

const commandFnMap = {
  "login": loginFn,
  "logout": logoutFn,
  "setpassword": setpasswordFn,
  "setaccountid": setaccountidFn,
  "status": statusFn,
  // Aliases
  "il": loginFn,
  "io": logoutFn,
  "i": statusFn,
}

module.exports = {
  command,
  commandFnMap,
}