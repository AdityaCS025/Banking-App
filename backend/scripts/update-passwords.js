const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function updatePasswords() {
    const pool = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });

    try {
        // Generate hash for Test@123
        const passwordHash = await bcrypt.hash('Test@123', 10);
        console.log('Generated password hash:', passwordHash);

        // Update all users with the new password hash
        const result = await pool.query(
            'UPDATE users SET password_hash = $1',
            [passwordHash]
        );

        console.log(`Updated ${result.rowCount} users with new password hash`);
        console.log('All users can now login with password: Test@123');
    } catch (error) {
        console.error('Error updating passwords:', error);
    } finally {
        await pool.end();
    }
}

updatePasswords();
