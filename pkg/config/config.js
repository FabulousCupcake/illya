const sarenConfig = require("saren/pkg/config/config.js");

const spreadsheetOverrides = {
  "Vanilla": "1G4hq1A6JLijwlno3lRxWYxETj7Jy3dBPIuLe9d871MQ",
};

const clanConfigs = sarenConfig.clanConfigs
  .filter(clan => clan.name === "Vanilla")
  .map(clan => ({
  ...clan,
  spreadsheetId: spreadsheetOverrides[clan.name],
}));

module.exports = {
  clanConfigs,
  ownerDiscordId: sarenConfig.ownerDiscordId,
}