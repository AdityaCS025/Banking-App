import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

// Support both DATABASE_URL (for deployment platforms) and individual env vars
const poolConfig: PoolConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        max: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'vaultbank',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        max: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    };

const pool = new Pool(poolConfig);

// Test database connection
pool.on('connect', () => {
    logger.info('Database connected successfully');
});

pool.on('error', (err) => {
    logger.error('Unexpected database error:', err);
    process.exit(-1);
});

// Helper function to execute queries
export const query = async (text: string, params?: any[]) => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        logger.debug('Executed query', { text, duration, rows: result.rowCount });
        return result;
    } catch (error) {
        logger.error('Database query error:', { text, error });
        throw error;
    }
};

// Helper function to get a client for transactions
export const getClient = async () => {
    const client = await pool.connect();
    const release = client.release.bind(client);

    // Set a timeout of 5 seconds for the client
    const timeout = setTimeout(() => {
        logger.error('Client checkout timeout');
        client.release();
    }, 5000);

    // Override release to clear timeout
    client.release = () => {
        clearTimeout(timeout);
        return release();
    };

    return client;
};

// Graceful shutdown
export const closePool = async () => {
    await pool.end();
    logger.info('Database pool closed');
};

export default pool;
