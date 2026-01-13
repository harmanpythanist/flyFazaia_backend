// db.js
const mysql = require("mysql2");
const fs = require("fs");
require("dotenv").config();

/**
 * Create a MySQL pool for Aiven MySQL
 * Works both locally (with ca.pem) and deployed (via env variable)
 */
function createPool() {
  // SSL config
  let sslConfig = {};
  if (process.env.DB_SSL) {
    // For deployment: DB_SSL stored as single line env variable with \n
    sslConfig.ca = process.env.DB_SSL.replace(/\\n/g, "\n");
  } else if (fs.existsSync("./certs/ca.pem")) {
    // For local dev: use downloaded ca.pem file
    sslConfig.ca = fs.readFileSync("./certs/ca.pem");
  } else {
    // fallback: rejectUnauthorized false (not secure, free-tier quick test)
    sslConfig.rejectUnauthorized = false;
  }

  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306, // default 3306 if not set
    user: process.env.DB_USER,
    password: process.env.DB_SECRET,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: sslConfig,
  }).promise();

  return pool;
}

// Initialize pool
let pool = createPool();

/**
 * Helper query function with retry for ETIMEDOUT / connection issues
 */
async function query(sql, params) {
  try {
    return await pool.query(sql, params);
  } catch (err) {
    console.error("DB query error:", err.message);

    // Retry on connection issues
    if (
      err.fatal ||
      err.code === "PROTOCOL_CONNECTION_LOST" ||
      err.code === "ETIMEDOUT" ||
      err.code === "ECONNREFUSED"
    ) {
      console.log("Attempting to reconnect to DB...");
      pool = createPool(); // recreate pool
      return await pool.query(sql, params); // retry once
    }

    throw err; // rethrow other errors
  }
}

module.exports = { db: pool, pool, query };
