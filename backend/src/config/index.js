const { corsPolicy } = require("./cors");
const { db } = require("./db");
const { env } = require("./env");
const { redis } = require("./redis");

module.exports = {
  cors: corsPolicy,
  db,
  env,
  redis,
};
