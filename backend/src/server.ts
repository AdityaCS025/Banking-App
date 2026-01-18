import app from './app';
import pool, { closePool } from './config/database';
import logger from './utils/logger';

const PORT = process.env.PORT || 5000;

// Test database connection before starting server
const startServer = async () => {
    try {
        // Test database connection
        await pool.query('SELECT NOW()');
        logger.info('Database connection established successfully');

        // Start server
        const server = app.listen(PORT, () => {
            logger.info(`🚀 VaultBank API server running on port ${PORT}`);
            logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
            logger.info(`🔗 API Base URL: http://localhost:${PORT}${process.env.API_PREFIX || '/api'}`);
        });

        // Graceful shutdown
        const gracefulShutdown = async (signal: string) => {
            logger.info(`${signal} received. Starting graceful shutdown...`);

            server.close(async () => {
                logger.info('HTTP server closed');

                try {
                    await closePool();
                    logger.info('Database connections closed');
                    process.exit(0);
                } catch (error) {
                    logger.error('Error during shutdown:', error);
                    process.exit(1);
                }
            });

            // Force shutdown after 10 seconds
            setTimeout(() => {
                logger.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        // Handle shutdown signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            logger.error('Uncaught Exception:', error);
            gracefulShutdown('uncaughtException');
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason: any, promise) => {
            logger.error('Unhandled Rejection:', {
                reason: reason?.message || reason?.toString() || String(reason),
                stack: reason?.stack,
                promise: String(promise)
            });
            // Don't shutdown - just log the error
            // gracefulShutdown('unhandledRejection');
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
startServer();
