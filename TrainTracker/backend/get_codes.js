const pool = require('./config/db');
const fs = require('fs');

async function getCodes() {
    try {
        const [rows] = await pool.query('SELECT id, email, verification_code, is_verified FROM users');
        fs.writeFileSync('users.json', JSON.stringify(rows, null, 2));
        console.log("Wrote users.json");
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

getCodes();
