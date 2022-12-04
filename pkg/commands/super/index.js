const { SlashCommandSubcommandGroupBuilder } = require("@discordjs/builders");

const { subcommand: login, subcommandFn: loginFn } = require("./login.js");
const { subcommand: logout, subcommandFn: logoutFn } = require("./logout.js");
const { subcommand: setpassword, subcommandFn: setpasswordFn } = require("./setpassword.js");

const command = new SlashCommandSubcommandGroupBuilder()
  .setName("super")
  .setDescription("Login or logout on behalf of someone else")
  .addSubcommand(login)
  .addSubcommand(logout)
  .addSubcommand(setpassword)

const commandFnMap = {
  "login": loginFn,
  "logout": logoutFn,
  "setpassword": setpasswordFn,
}

module.exports = {
  command,
  commandFnMap,
}