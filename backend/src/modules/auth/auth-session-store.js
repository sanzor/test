const { env } = require("../../config");
const {
  getCachedString,
  setCachedString,
  deleteCachedKey,
} = require("../../utils");

const getRefreshTokenTtlInSeconds = () => {
  const ttlMs = Number(env.JWT_REFRESH_TOKEN_TIME_IN_MS || 0);
  if (!ttlMs || Number.isNaN(ttlMs)) return 0;
  return Math.floor(ttlMs / 1000);
};

const tokenCacheKey = (refreshToken) => `session:refresh:${refreshToken}`;
const userCacheKey = (userId) => `session:user:${userId}:refresh`;

const upsertRefreshSession = async ({ userId, refreshToken }) => {
  const ttlSeconds = getRefreshTokenTtlInSeconds();
  const userKey = userCacheKey(userId);

  const oldRefreshToken = await getCachedString(userKey);
  if (oldRefreshToken && oldRefreshToken !== refreshToken) {
    await deleteCachedKey(tokenCacheKey(oldRefreshToken));
  }

  await setCachedString(userKey, refreshToken, ttlSeconds);
  await setCachedString(tokenCacheKey(refreshToken), String(userId), ttlSeconds);
};

const invalidateRefreshSessionByToken = async (refreshToken) => {
  const sessionKey = tokenCacheKey(refreshToken);
  const userId = await getCachedString(sessionKey);

  await deleteCachedKey(sessionKey);
  if (userId) {
    await deleteCachedKey(userCacheKey(userId));
  }
};

const getUserIdByRefreshTokenFromCache = async (refreshToken) => {
  const userId = await getCachedString(tokenCacheKey(refreshToken));
  if (!userId) return null;

  const parsedUserId = Number(userId);
  return Number.isNaN(parsedUserId) ? null : parsedUserId;
};

module.exports = {
  upsertRefreshSession,
  invalidateRefreshSessionByToken,
  getUserIdByRefreshTokenFromCache,
};
