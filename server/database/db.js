const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' }); // Load .env from root

const dbOltp = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_OLTP || 'parking__system',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const dbWarehouse = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_WAREHOUSE || 'parking_warehouse',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = { dbOltp, dbWarehouse };
