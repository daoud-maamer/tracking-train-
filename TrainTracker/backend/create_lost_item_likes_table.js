require('dotenv').config();
const pool = require('./config/db');

async function createLostItemLikesTable() {
    try {
        const connection = await pool.getConnection();

        await connection.query(`
            CREATE TABLE IF NOT EXISTS lost_item_likes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                item_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_user_item (user_id, item_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (item_id) REFERENCES lost_items(id) ON DELETE CASCADE
            )
        `);

        console.log('✅ Table "lost_item_likes" created or already exists.');
        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating table:', error.message);
        process.exit(1);
    }
}

createLostItemLikesTable();
