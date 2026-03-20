// db.js
const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',          // replace with your MySQL username
  password: 'yourpassword', // replace with your MySQL password
  database: 'frontend_db'   // replace with your database name
});

module.exports = db;
