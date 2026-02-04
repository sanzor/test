const { env } = require("../../config");

const insertRefreshToken = async ({ userId, refreshToken }, client) => {
  const expiresAt = new Date(
    Date.now() + parseInt(env.JWT_REFRESH_TOKEN_TIME_IN_MS)
  );
  await client.query({
    name: "auth-insert-refresh-token",
    text: "INSERT INTO user_refresh_tokens (token, user_id, expires_at) VALUES($1, $2, $3)",
    values: [refreshToken, userId, expiresAt],
  });
};

module.exports = { insertRefreshToken };
