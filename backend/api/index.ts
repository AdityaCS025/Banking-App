import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

// Force rebuild - updated models for virtual_cards and deposits tables
const app = express();

// CORS - Must be first!
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:8080',
    'https://vault-bank-beta.vercel.app'
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(null, true); // Allow all for now to debug
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Handle preflight requests explicitly
app.options('*', (_req: Request, res: Response) => {
    res.header('Access-Control-Allow-Origin', 'https://vault-bank-beta.vercel.app');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
});

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check (before other routes)
app.get('/health', (_req: Request, res: Response) => {
    res.json({
        success: true,
        message: 'VaultBank API is running on Vercel',
        timestamp: new Date().toISOString(),
        cors: allowedOrigins,
    });
});

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
    res.json({
        success: true,
        message: 'VaultBank API - Welcome',
    });
});

// Import routes directly to avoid CORS conflicts
import authRoutes from '../src/routes/authRoutes';
import accountRoutes from '../src/routes/accountRoutes';
import transactionRoutes from '../src/routes/transactionRoutes';
import cibilRoutes from '../src/routes/cibilRoutes';
import cardRoutes from '../src/routes/cardRoutes';
import depositRoutes from '../src/routes/depositRoutes';
import chatbotRoutes from '../src/routes/chatbotRoutes';

const API_PREFIX = '/api';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/accounts`, accountRoutes);
app.use(`${API_PREFIX}/transactions`, transactionRoutes);
app.use(`${API_PREFIX}/cibil`, cibilRoutes);
app.use(`${API_PREFIX}/cards`, cardRoutes);
app.use(`${API_PREFIX}/deposits`, depositRoutes);
app.use(`${API_PREFIX}/chatbot`, chatbotRoutes);

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Error:', err.message);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});

// 404 handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
    });
});

export default app;
