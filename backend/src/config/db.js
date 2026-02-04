const { Pool } = require("pg");
const { env } = require("./env");

const db = new Pool({
  connectionString: env.DATABASE_URL,
  max: env.DB_POOL_MAX ? Number(env.DB_POOL_MAX) : 20,
  idleTimeoutMillis: env.DB_IDLE_TIMEOUT_MS
    ? Number(env.DB_IDLE_TIMEOUT_MS)
    : 30000,
  connectionTimeoutMillis: env.DB_CONNECTION_TIMEOUT_MS
    ? Number(env.DB_CONNECTION_TIMEOUT_MS)
    : 5000,
});

module.exports = { db };
