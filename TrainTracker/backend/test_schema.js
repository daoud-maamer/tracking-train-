const pool = require('./config/db');
const fs = require('fs');

async function checkSchema() {
    try {
        const [rows] = await pool.query('DESCRIBE lost_items');
        fs.writeFileSync('schema.json', JSON.stringify(rows, null, 2));
        console.log("Written to schema.json");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema();
