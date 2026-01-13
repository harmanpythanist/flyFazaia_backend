const mysql = require("mysql2");
require('dotenv').config()

function createPool() {
  return mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER, 
    password: process.env.DB_SECRET, 
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: { rejectUnauthorized: true }
  }).promise();
}

// Initialize pool
let pool = createPool();
let db = pool; // db is just a promise-wrapped pool

// Optional: helper query function with auto-reconnect
async function query(sql, params) {
  try {
    return await db.query(sql, params);
  } catch (err) {
    console.error("DB query error:", err.message);

    // If error is connection-related, try to reconnect
    if (err.fatal || err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNREFUSED') {
      console.log("Attempting to reconnect to DB...");
      pool = createPool(); // re-create the pool
      db = pool;
      return await db.query(sql, params); // retry query once
    }

    // If other error, re-throw
    throw err;
  }
}

module.exports = { db, pool, query };
