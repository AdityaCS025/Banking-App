import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import logger from '../utils/logger';

/**
 * Role-based authorization middleware
 */
export const requireRole = (allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                });
                return;
            }

            if (!allowedRoles.includes(req.user.role)) {
                logger.warn(`Unauthorized access attempt by user ${req.user.id} with role ${req.user.role}`);
                res.status(403).json({
                    success: false,
                    message: 'You do not have permission to access this resource',
                });
                return;
            }

            next();
        } catch (error) {
            logger.error('Authorization error:', error);
            res.status(500).json({
                success: false,
                message: 'Authorization failed',
            });
        }
    };
};

/**
 * Check if user is customer
 */
export const requireCustomer = requireRole(['customer']);

/**
 * Check if user is admin or banker
 */
export const requireAdmin = requireRole(['admin', 'banker']);

/**
 * Check if user is admin only
 */
export const requireAdminOnly = requireRole(['admin']);

export default requireRole;
