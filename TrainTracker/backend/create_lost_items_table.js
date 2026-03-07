require('dotenv').config();
const pool = require('./config/db');

async function createLostItemsTable() {
    try {
        const connection = await pool.getConnection();

        await connection.query(`
            CREATE TABLE IF NOT EXISTS lost_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                type ENUM('lost', 'found') NOT NULL DEFAULT 'lost',
                author VARCHAR(100) NOT NULL,
                item VARCHAR(200) NOT NULL,
                description TEXT,
                location VARCHAR(200),
                item_date DATE,
                item_time TIME,
                contact VARCHAR(100) NOT NULL,
                image_url VARCHAR(500),
                status ENUM('active', 'resolved') DEFAULT 'active',
                likes INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NOT NULL
            )
        `);

        console.log('✅ Table "lost_items" created or already exists.');
        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating table:', error.message);
        process.exit(1);
    }
}

createLostItemsTable();
