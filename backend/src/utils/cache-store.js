const { redis } = require("../config");

const isCacheReady = () => Boolean(redis && redis.isReady);

const getCachedString = async (key) => {
  if (!isCacheReady()) return null;
  try {
    return await redis.get(key);
  } catch (error) {
    return null;
  }
};

const setCachedString = async (key, value, ttlSeconds) => {
  if (!isCacheReady()) return false;
  try {
    if (ttlSeconds && Number(ttlSeconds) > 0) {
      await redis.set(key, value, { EX: Number(ttlSeconds) });
      return true;
    }

    await redis.set(key, value);
    return true;
  } catch (error) {
    return false;
  }
};

const getCachedJson = async (key) => {
  const value = await getCachedString(key);
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
};

const setCachedJson = async (key, value, ttlSeconds) => {
  return setCachedString(key, JSON.stringify(value), ttlSeconds);
};

const deleteCachedKey = async (key) => {
  if (!isCacheReady()) return false;
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    return false;
  }
};

module.exports = {
  getCachedString,
  setCachedString,
  getCachedJson,
  setCachedJson,
  deleteCachedKey,
};
