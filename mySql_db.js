const mysql = require("mysql2");
require('dotenv').config()
function createPool() {
  return mysql.createPool({ host: process.env.DB_HOST,
  port: process.env.DB_PORT,       // add this line
  user: process.env.DB_USER,
  password: process.env.DB_SECRET,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {  ca: process.env.DB_SSL } 
  }).promise();
}

// Initialize pool
let db = createPool();

// Helper to reconnect automatically if connection fails
async function query(sql, params) {
  try {
    return await db.query(sql, params);
  } catch (err) {
    console.error("DB query error:", err.message);

    // If error is connection-related, try to reconnect
    if (err.fatal || err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNREFUSED') {
      console.log("Attempting to reconnect to DB...");
      db = createPool(); // re-create the pool
      return await db.query(sql, params); // retry query once
    }

    // If other error, re-throw
    throw err;
  }
}

module.exports = { db, query };
