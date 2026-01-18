const { exec } = require('child_process');
const path = require('path');
require('dotenv').config();

const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');

const command = `psql -U ${process.env.DB_USER} -h ${process.env.DB_HOST} -d ${process.env.DB_NAME} -f "${schemaPath}"`;

console.log('Running database migrations...');
console.log(`Database: ${process.env.DB_NAME}`);

const childProcess = exec(command, {
    env: {
        ...process.env,
        PGPASSWORD: process.env.DB_PASSWORD,
        PAGER: ''
    }
});

childProcess.stdout.on('data', (data) => {
    console.log(data.toString());
});

childProcess.stderr.on('data', (data) => {
    console.error(data.toString());
});

childProcess.on('close', (code) => {
    if (code === 0) {
        console.log('✅ Database migrations completed successfully!');
    } else {
        console.error(`❌ Migration failed with exit code ${code}`);
        process.exit(code);
    }
});
