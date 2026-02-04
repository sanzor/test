const { createClient } = require("redis");
const { env } = require("./env");

let redis = null;

if (env.REDIS_URL) {
  redis = createClient({
    url: env.REDIS_URL,
    socket: {
      reconnectStrategy: () => false,
    },
  });

  redis.on("error", (error) => {
    console.error("Redis error:", error.message);
  });

  redis.connect().catch((error) => {
    console.error("Redis connection failed:", error.message);
  });
}

module.exports = { redis };
