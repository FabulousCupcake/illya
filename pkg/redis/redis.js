const { createClient } = require("redis");
const { promisify } = require("util");

let redisClient;

const initializeRedisClient = async () => {
  redisClient = createClient({
    url: process.env.REDIS_URL,
    disableOfflineQueue: true,
    retry_strategy: function(options) {
      if (options.error && options.error.code === "ECONNREFUSED") {
        // End reconnecting on a specific error and flush all commands with
        // a individual error
        return new Error("The server refused the connection");
      }
      if (options.total_retry_time > 1000 * 60 * 60) {
        // End reconnecting after a specific timeout and flush all commands
        // with a individual error
        return new Error("Retry time exhausted");
      }
      if (options.attempt > 10) {
        // End reconnecting with built in error
        return undefined;
      }
      // reconnect after
      return Math.min(options.attempt * 100, 3000);
    },

  });
  // redisClient.on("error", err => console.log('Redis Client Error', err));
  // await redisClient.connect(); // only needed in redis@v4

  redisClient.async = {};
  redisClient.async.get = promisify(redisClient.get).bind(redisClient);
  redisClient.async.set = promisify(redisClient.set).bind(redisClient);
  redisClient.async.del = promisify(redisClient.del).bind(redisClient);
  redisClient.async.keys = promisify(redisClient.keys).bind(redisClient);
  redisClient.async.setnx = promisify(redisClient.setnx).bind(redisClient);

  console.log("Successfully initialized Redis Client");
}

const setPassword = async (discordId, password) => {
  const key = `password-${discordId}`;
  await redisClient.async.set(key, password);
}

const getPassword = async (discordId) => {
  const key = `password-${discordId}`;
  return await redisClient.async.get(key);
}

const addLoginMutex = async (accountDiscordId, pilotDiscordId) => {
  const key = `login-${accountDiscordId}:pilot`;

  // Try to set
  const status = await redisClient.async.setnx(key, pilotDiscordId);
  if (!status) return false;

  // Set timestamp
  const timeKey = `login-${accountDiscordId}:time`;
  const timestamp = Math.round(new Date().getTime() / 1000);
  await redisClient.async.setnx(timeKey, timestamp);
  return true;
}

const checkLoginMutex = async (accountDiscordId) => {
  const key = `login-${accountDiscordId}:pilot`;
  const timeKey = `login-${accountDiscordId}:time`;

  const pilot = await redisClient.async.get(key);
  const timestamp = await redisClient.async.get(timeKey);

  if (!pilot) return false;

  return { pilot, timestamp };
}

const removeLoginMutex = async (accountDiscordId) => {
  const key = `login-${accountDiscordId}:pilot`;
  const timeKey = `login-${accountDiscordId}:time`;

  await redisClient.async.del(key);
  await redisClient.async.del(timeKey);
}

const listLoginMutexes = async () => {
  const keys = await redisClient.async.keys("login-*:pilot");
  const result = [];

  for (const key of keys) {
    const accountDiscordId = key.match(/-([0-9]+):/)[1];
    const timeKey = `login-${accountDiscordId}:time`;

    const pilot = await redisClient.async.get(key);
    const timestamp = await redisClient.async.get(timeKey);

    result.push({ account: accountDiscordId, pilot, timestamp });
  }

  return result;
}

const addPilot = async (discordId) => {
  const key = `pilot-${discordId}`;
  await redisClient.async.set(key, discordId);
}

const removePilot = async (discordId) => {
  const key = `pilot-${discordId}`;
  await redisClient.async.del(key);
}

const isPilot = async (discordId) => {
  const key = `pilot-${discordId}`;
  await !!redisClient.async.get(key);
}

const listPilots = async () => {
  const keys = await redisClient.async.keys("pilot-*");
  const pilots = keys.map(key => key.replace("pilot-", ""));
  return pilots;
}

const getRedisClient = () => {
  return redisClient;
}

module.exports = {
  initializeRedisClient,
  getRedisClient,

  setPassword,
  getPassword,

  addLoginMutex,
  checkLoginMutex,
  removeLoginMutex,
  listLoginMutexes,

  addPilot,
  removePilot,
  isPilot,
  listPilots,
}