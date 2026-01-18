import { Request, Response } from 'express';
import authService from '../services/authService';
import { AuthRequest } from '../middlewares/auth';
import logger from '../utils/logger';

class AuthController {
    /**
     * Register a new user
     */
    async register(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, full_name, phone, date_of_birth, pan_number, aadhaar_number, address } = req.body;

            const result = await authService.register({
                email,
                password,
                full_name,
                phone,
                date_of_birth,
                pan_number,
                aadhaar_number,
                address,
            });

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                },
            });
        } catch (error: any) {
            logger.error('Registration error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Registration failed',
            });
        }
    }

    /**
     * Login user
     */
    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            const result = await authService.login(email, password);

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                },
            });
        } catch (error: any) {
            logger.error('Login error:', error);
            res.status(401).json({
                success: false,
                message: error.message || 'Login failed',
            });
        }
    }

    /**
     * Refresh access token
     */
    async refreshToken(req: Request, res: Response): Promise<void> {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                res.status(400).json({
                    success: false,
                    message: 'Refresh token is required',
                });
                return;
            }

            const result = await authService.refreshToken(refreshToken);

            res.status(200).json({
                success: true,
                message: 'Token refreshed successfully',
                data: result,
            });
        } catch (error: any) {
            logger.error('Token refresh error:', error);
            res.status(401).json({
                success: false,
                message: error.message || 'Token refresh failed',
            });
        }
    }

    /**
     * Logout user
     */
    async logout(req: Request, res: Response): Promise<void> {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                res.status(400).json({
                    success: false,
                    message: 'Refresh token is required',
                });
                return;
            }

            await authService.logout(refreshToken);

            res.status(200).json({
                success: true,
                message: 'Logout successful',
            });
        } catch (error: any) {
            logger.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: 'Logout failed',
            });
        }
    }

    /**
     * Send OTP
     */
    async sendOTP(req: Request, res: Response): Promise<void> {
        try {
            const { email, purpose } = req.body;

            const otp = await authService.generateOTP(email, purpose || 'verification');

            // In production, send OTP via email
            // For development, return OTP in response
            const responseData = process.env.NODE_ENV === 'development'
                ? { otp } // Only in development
                : {};

            res.status(200).json({
                success: true,
                message: 'OTP sent successfully',
                data: responseData,
            });
        } catch (error: any) {
            logger.error('Send OTP error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to send OTP',
            });
        }
    }

    /**
     * Verify OTP
     */
    async verifyOTP(req: Request, res: Response): Promise<void> {
        try {
            const { email, otp, purpose } = req.body;

            const isValid = await authService.verifyOTP(email, otp, purpose || 'verification');

            if (!isValid) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid or expired OTP',
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'OTP verified successfully',
            });
        } catch (error: any) {
            logger.error('Verify OTP error:', error);
            res.status(400).json({
                success: false,
                message: 'OTP verification failed',
            });
        }
    }

    /**
     * Get current user profile
     */
    async getProfile(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const UserModel = (await import('../models/User')).default;
            const user = await UserModel.findById(userId);

            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: { user },
            });
        } catch (error: any) {
            logger.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch profile',
            });
        }
    }

    /**
     * Update user profile
     */
    async updateProfile(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const { full_name, phone, address } = req.body;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const UserModel = (await import('../models/User')).default;
            const updatedUser = await UserModel.updateProfile(userId, {
                full_name,
                phone,
                address,
            });

            if (!updatedUser) {
                res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data: { user: updatedUser },
            });
        } catch (error: any) {
            logger.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update profile',
            });
        }
    }

    /**
     * Change password
     */
    async changePassword(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const { current_password, new_password } = req.body;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            if (!current_password || !new_password) {
                res.status(400).json({
                    success: false,
                    message: 'Current password and new password are required',
                });
                return;
            }

            if (new_password.length < 8) {
                res.status(400).json({
                    success: false,
                    message: 'New password must be at least 8 characters',
                });
                return;
            }

            const UserModel = (await import('../models/User')).default;
            const user = await UserModel.findByEmail((await UserModel.findById(userId))?.email || '', true);

            if (!user || !user.password_hash) {
                res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
                return;
            }

            // Verify current password
            const bcrypt = await import('bcryptjs');
            const isValidPassword = await bcrypt.compare(current_password, user.password_hash);

            if (!isValidPassword) {
                res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect',
                });
                return;
            }

            // Update password (model will hash it)
            await UserModel.updatePassword(userId, new_password);

            res.status(200).json({
                success: true,
                message: 'Password changed successfully',
            });
        } catch (error: any) {
            logger.error('Change password error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to change password',
            });
        }
    }

    /**
     * Get all users (banker/admin only)
     */
    async getAllUsers(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userRole = req.user?.role;

            if (!userRole || !['banker', 'admin'].includes(userRole)) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied. Banker or admin role required.',
                });
                return;
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 100;

            const UserModel = (await import('../models/User')).default;
            const result = await UserModel.findAll(page, limit);

            res.status(200).json({
                success: true,
                data: {
                    users: result.users,
                    total: result.total,
                    page,
                    limit,
                },
            });
        } catch (error: any) {
            logger.error('Get all users error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch users',
            });
        }
    }

    /**
     * Update user KYC status (banker/admin only)
     */
    async updateUserKyc(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userRole = req.user?.role;
            const { userId } = req.params;
            const { kyc_status } = req.body;

            if (!userRole || !['banker', 'admin'].includes(userRole)) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied. Banker or admin role required.',
                });
                return;
            }

            if (!kyc_status || !['pending', 'approved', 'rejected'].includes(kyc_status)) {
                res.status(400).json({
                    success: false,
                    message: 'Valid KYC status is required (pending, approved, rejected)',
                });
                return;
            }

            const UserModel = (await import('../models/User')).default;
            const updatedUser = await UserModel.updateKYCStatus(userId, kyc_status);

            if (!updatedUser) {
                res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: `KYC status updated to ${kyc_status}`,
                data: { user: updatedUser },
            });
        } catch (error: any) {
            logger.error('Update KYC status error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update KYC status',
            });
        }
    }
}

export default new AuthController();
