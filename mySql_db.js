const mysql=require("mysql2");
const pool=mysql.createPool({ host: '127.0.0.1',
  user: 'root',
  password: 'mrhassan125',
  database: 'flyfazaia',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0});
  const db=pool.promise();

  module.exports={db,pool};