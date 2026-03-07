const pool = require('./config/db');

async function checkDB() {
    try {
        console.log('Testing connection to MySQL...');
        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        console.log('Connection successful! Result:', rows[0].result);

        console.log('Checking tables...');
        const [tables] = await pool.query('SHOW TABLES');
        console.log('Tables found:', tables);

        const [trains] = await pool.query('SELECT COUNT(*) as count FROM trains');
        console.log('Trains count:', trains[0].count);

        const [positions] = await pool.query('SELECT COUNT(*) as count FROM positions');
        console.log('Positions count:', positions[0].count);

        process.exit(0);
    } catch (err) {
        console.error('DATABASE CHECK FAILED:', err.message);
        process.exit(1);
    }
}

checkDB();
