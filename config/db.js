const mysql = require('mysql2');
require('dotenv').config();

// 1. Create the Pool (Not a single connection)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10, // Max 10 simultaneous users
    queueLimit: 0
});

// 2. Test Connection (And RELEASE it immediately)
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ DB Connection Failed:', err.code);
        console.error('   Details:', err.message);
    } else {
        console.log('✅ MySQL Database Connected Successfully');
        // CRITICAL: Release the connection back to the pool immediately!
        connection.release(); 
    }
});

// 3. Export the Standard Pool
// (Controllers will call .promise() on this object themselves)
module.exports = pool;