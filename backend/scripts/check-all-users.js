const { Pool } = require('pg');
require('dotenv').config();

async function checkAllUsers() {
    const pool = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });

    try {
        const result = await pool.query(
            'SELECT id, email, full_name, role, kyc_status, is_active, created_at FROM users ORDER BY created_at'
        );

        console.log(`Total users in database: ${result.rows.length}\n`);

        if (result.rows.length > 0) {
            console.log('Users found:');
            result.rows.forEach((user, index) => {
                console.log(`\n${index + 1}. ${user.full_name}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Role: ${user.role}`);
                console.log(`   KYC Status: ${user.kyc_status}`);
                console.log(`   Active: ${user.is_active}`);
                console.log(`   Created: ${user.created_at}`);
            });
        } else {
            console.log('⚠️  No users found in database - all user data appears to be deleted!');
        }
    } catch (error) {
        console.error('Error checking users:', error);
    } finally {
        await pool.end();
    }
}

checkAllUsers();
