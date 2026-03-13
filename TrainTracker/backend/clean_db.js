const pool = require('./config/db');

async function clean() {
    try {
        const [result] = await pool.query('DELETE FROM users WHERE is_verified = 0');
        console.log(`Unverified users removed. Rows affected: ${result.affectedRows}`);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

clean();
