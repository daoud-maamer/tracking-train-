const pool = require('./config/db');
const bcrypt = require('bcrypt');

async function createAdminDepot() {
    try {
        const email = 'admin2@depot.com';
        const password = 'admin'; // simple password
        
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        
        // Ensure user ID 2 is properly configured
        const [result] = await pool.query(
            'UPDATE users SET email = ?, password_hash = ?, is_verified = TRUE WHERE id = 2',
            [email, passwordHash]
        );
        
        if (result.affectedRows === 0) {
            // Insert if it didn't exist
            await pool.query(
                'INSERT INTO users (id, email, password_hash, is_verified) VALUES (2, ?, ?, TRUE)',
                [email, passwordHash]
            );
            console.log('✅ Inserted new Admin Depot user with ID 2');
        } else {
            console.log('✅ Updated existing Admin Depot user with ID 2');
        }
        
        console.log(`\n🔑 You can now log in with:`);
        console.log(`📧 Email: ${email}`);
        console.log(`🔐 Password: ${password}\n`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

createAdminDepot();
