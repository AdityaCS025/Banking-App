const { Pool } = require('pg');
require('dotenv').config();

async function checkUser() {
    const pool = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });

    try {
        const result = await pool.query(
            'SELECT id, email, full_name, role, kyc_status, is_active, created_at FROM users WHERE email = $1',
            ['aikugreen02@gmail.com']
        );

        if (result.rows.length > 0) {
            console.log('User found:');
            console.log(JSON.stringify(result.rows[0], null, 2));
        } else {
            console.log('No user found with email: aikugreen02@gmail.com');
        }
    } catch (error) {
        console.error('Error checking user:', error);
    } finally {
        await pool.end();
    }
}

checkUser();
