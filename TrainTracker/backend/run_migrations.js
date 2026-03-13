const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'train_tracker'
    });

    try {
        await pool.query(`CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      verification_code VARCHAR(10),
      is_verified BOOLEAN DEFAULT FALSE,
      role ENUM('user', 'admin') DEFAULT 'user'
    )`);
        console.log('Created users table');

        // Add status column to lost_items if it doesn't exist
        // MySQL 8+ syntax. If it fails, ignore (might already exist)
        try {
            await pool.query(`ALTER TABLE lost_items ADD COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'`);
            console.log('Added status column to lost items table');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('Status column already exists');
            } else {
                console.log('Error adding column, might already exist', e.message);
                // Or try another way if that failed
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

run();
