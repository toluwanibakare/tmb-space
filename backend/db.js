const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tmb',
  waitForConnections: true,
  connectionLimit: 10,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  timezone: 'Z',
});

module.exports = pool;
