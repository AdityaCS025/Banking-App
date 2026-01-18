import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();

// Security & CORS
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (_req: Request, res: Response) => {
    res.json({
        success: true,
        message: 'VaultBank API is running on Vercel',
        timestamp: new Date().toISOString(),
    });
});

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
    res.json({
        success: true,
        message: 'VaultBank API - Welcome',
        endpoints: {
            health: '/health',
            api: '/api/*'
        }
    });
});

// Import and use main app routes
import mainApp from '../src/app';
app.use('/', mainApp);

export default app;
