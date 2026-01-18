import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';
import logger from '../utils/logger';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

/**
 * Verify JWT access token
 */
export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'No token provided. Please login to continue.',
            });
            return;
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        try {
            const decoded = jwt.verify(token, jwtConfig.accessSecret) as {
                id: string;
                email: string;
                role: string;
            };

            req.user = decoded;
            next();
        } catch (error: any) {
            if (error.name === 'TokenExpiredError') {
                res.status(401).json({
                    success: false,
                    message: 'Token expired. Please refresh your token.',
                    code: 'TOKEN_EXPIRED',
                });
                return;
            }

            if (error.name === 'JsonWebTokenError') {
                res.status(401).json({
                    success: false,
                    message: 'Invalid token. Please login again.',
                });
                return;
            }

            throw error;
        }
    } catch (error) {
        logger.error('Authentication error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication failed',
        });
    }
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            next();
            return;
        }

        const token = authHeader.substring(7);

        try {
            const decoded = jwt.verify(token, jwtConfig.accessSecret) as {
                id: string;
                email: string;
                role: string;
            };

            req.user = decoded;
        } catch (error) {
            // Silently fail for optional auth
            logger.debug('Optional auth failed:', error);
        }

        next();
    } catch (error) {
        logger.error('Optional authentication error:', error);
        next();
    }
};

export default authenticate;
