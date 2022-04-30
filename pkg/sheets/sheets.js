const { GoogleSpreadsheet } = require("google-spreadsheet");
const { clanConfigs } = require("../config/config");

const SHEET_TITLE = "Hit Coordinate";

// Note: Zero-indexed
const COLUMN_HITTER_ID = 0;
const COLUMN_HITTER_NAME = 1;
const COLUMN_OWNER_ID = 2;
const COLUMN_OWNER_NAME = 3;
const COLUMN_TIMELINE = 4;
const COLUMN_DAMAGE = 5;
const COLUMN_STATUS = 6;
const ROW_HITS_START = 4;
const ROW_AVAIL_START = 36;

const docs = {};

const initializeSpreadsheetClient = async () => {
  // Populate docs/client list
  clanConfigs.forEach(clan => {
    docs[clan.name] = new GoogleSpreadsheet(clan.spreadsheetId);
  });

  // Initialize clients
  for (const key in docs) {
    const doc = docs[key];

    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY,
    });
    await doc.loadInfo();

    console.log("Successfully initialized Google Spreadsheet Client", doc.title);
  }
};

// Reads sheets to JSON
const readSheet = async(clanName) => {
  const doc = docs[clanName];
  doc.resetLocalCache();
  await doc.loadInfo();

  const sheet = doc.sheetsByTitle[SHEET_TITLE];
  await sheet.loadCells(["A1:G34", "A37:B66", "B2:C2", "J4"]);

  // Read metadatas
  const position = sheet.getCell(1, 1).value;
  const bossName = sheet.getCell(1, 2).value;
  const bossHp = sheet.getCell(3, 9).value;

  // Read each rows
  const entries = [];
  for(let i=0; i<30; i++) {
    const row = ROW_HITS_START + i;
    const entry = {
      hitterId: sheet.getCell(row, COLUMN_HITTER_ID).value,
      hitterName: sheet.getCell(row, COLUMN_HITTER_NAME).value,
      ownerId: sheet.getCell(row, COLUMN_OWNER_ID).value,
      ownerName: sheet.getCell(row, COLUMN_OWNER_NAME).value,
      timeline: sheet.getCell(row, COLUMN_TIMELINE).value,
      damage: sheet.getCell(row, COLUMN_DAMAGE).value,
      status: sheet.getCell(row, COLUMN_STATUS).value,
    };

    if (!entry.hitterId) break;
    entries.push(entry);
  }

  // Again for availability
  const avails = []
  for(let i=0; i<30; i++) {
    const row = ROW_AVAIL_START + i;
    const avail = {
      id: sheet.getCell(row, COLUMN_HITTER_ID).value,
      name: sheet.getCell(row, COLUMN_HITTER_NAME).value,
    }

    if (!avail.id) break;
    avails.push(avail);
  }

  return {
    entries,
    avails,
    position,
    bossName,
    bossHp,
  };
};

// Writes JSON to sheet
const writeSheet = async(clanName, data) => {
  const doc = docs[clanName];
  const sheet = doc.sheetsByTitle(SHEET_TITLE);
  await sheet.loadCells(["A1:G34", "A37:A66"]);

  // Write all hit entries
  data.entries.forEach((entry, index) => {
    const row = ROW_HITS_START + index;

    const cellHitterId = sheet.getCell(row, COLUMN_HITTER_ID);
    const cellHitterName = sheet.getCell(row, COLUMN_HITTER_NAME);
    const cellOwnerId = sheet.getCell(row, COLUMN_OWNER_ID);
    const cellOwnerName = sheet.getCell(row, COLUMN_OWNER_NAME);
    const cellTimeline = sheet.getCell(row, COLUMN_TIMELINE);
    const cellDamage = sheet.getCell(row, COLUMN_DAMAGE);
    const cellStatus = sheet.getCell(row, COLUMN_STATUS);

    cellHitterId.value = entry.cellHitterId;
    cellHitterName.value = entry.cellHitterName;
    cellOwnerId.value = entry.cellOwnerId;
    cellOwnerName.value = entry.cellOwnerName;
    cellTimeline.value = entry.cellTimeline;
    cellDamage.value = entry.cellDamage;
    cellStatus.value = entry.cellStatus;
  });

  // And again for availability
  data.avails.forEach((avail, index) => {
    const row = ROW_AVAIL_START + index;

    const cellId = sheet.getCell(row, COLUMN_HITTER_ID);
    const cellName = sheet.getCell(row, COLUMN_HITTER_NAME);

    cellId.value = avail.id;
    cellName.value = avail.name;
  });

  // Write
  return await sheet.saveUpdatedCells();
};

module.exports = {
  initializeSpreadsheetClient,
  readSheet,
  writeSheet,
};