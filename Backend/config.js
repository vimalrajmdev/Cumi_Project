require('dotenv').config();

// Database connection settings come from Backend/.env (DB_SERVER, DB_NAME,
// DB_USER, DB_PASSWORD, DB_PORT). The fallbacks keep local dev working.
const config = {
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'CumiFG',
    user: process.env.DB_USER || 'rspmdevuser',
    password: process.env.DB_PASSWORD || 'Welcomesql',
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
    // Heavy reports (e.g. the 6.5k-row "With RFID" list) can briefly exceed the
    // 15s mssql default under lock contention. 60s prevents a hard timeout while
    // normal requests still return in well under a second.
    requestTimeout: 60000,
    port: parseInt(process.env.DB_PORT, 10) || 1433,
    pool: {
        max: 100, // Adjust based on your load
        min: 10,
        idleTimeoutMillis: 60000
    }
};

module.exports = config;
