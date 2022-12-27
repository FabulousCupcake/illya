const { SlashCommandBuilder } = require("@discordjs/builders");

const { subcommand: login, subcommandFn: loginFn } = require("./login.js");
const { subcommand: logout, subcommandFn: logoutFn } = require("./logout.js");
const { subcommand: setpassword, subcommandFn: setpasswordFn } = require("./setpassword.js");
const { subcommand: setaccountid, subcommandFn: setaccountidFn } = require("./setaccountid.js");
const { subcommand: setchannel, subcommandFn: setchannelFn } = require("./setchannel.js");
const { subcommand: status, subcommandFn: statusFn } = require("./status.js");

const command = new SlashCommandBuilder()
  .setName("illya")
  .setDescription("A Clan Battle Coordination Bot")
  .addSubcommand(login)
  .addSubcommand(logout)
  .addSubcommand(setpassword)
  .addSubcommand(setaccountid)
  .addSubcommand(setchannel)
  .addSubcommand(status)

// Aliases
const buildAliasCommand = (name, subcommand) => {
  const cmd = new SlashCommandBuilder();
  cmd.name = name;
  cmd.description = subcommand.description;
  cmd.options = subcommand.options;

  return cmd
}
const loginAliasCommand = buildAliasCommand("il", login);
const logoutAliasCommand = buildAliasCommand("io", logout);
const statusAliasCommand = buildAliasCommand("ii", status);

const commandFnMap = {
  "login": loginFn,
  "logout": logoutFn,
  "setpassword": setpasswordFn,
  "setaccountid": setaccountidFn,
  "setchannel": setchannelFn,
  "status": statusFn,
}

const loginCommandFn = loginFn;
const logoutCommandFn = logoutFn;
const statusCommandFn = statusFn;

module.exports = {
  command,
  commandFnMap,
  loginAliasCommand,
  logoutAliasCommand,
  statusAliasCommand,
  loginCommandFn,
  logoutCommandFn,
  statusCommandFn,
}