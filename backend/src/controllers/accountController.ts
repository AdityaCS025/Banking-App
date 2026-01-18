import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import AccountModel from '../models/Account';
import logger from '../utils/logger';

class AccountController {
    /**
     * Get all accounts for current user
     */
    async getMyAccounts(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const accounts = await AccountModel.findByUserId(userId);

            // Calculate total balance
            const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance.toString()), 0);

            res.status(200).json({
                success: true,
                data: {
                    accounts,
                    total_balance: totalBalance,
                },
            });
        } catch (error: any) {
            logger.error('Get accounts error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch accounts',
            });
        }
    }

    /**
     * Create a new account
     */
    async createAccount(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const { account_type } = req.body;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const account = await AccountModel.create({
                user_id: userId,
                account_type,
            });

            res.status(201).json({
                success: true,
                message: 'Account created successfully',
                data: { account },
            });
        } catch (error: any) {
            logger.error('Create account error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create account',
            });
        }
    }

    /**
     * Get account by ID
     */
    async getAccountById(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const { id } = req.params;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const account = await AccountModel.findById(id);

            if (!account) {
                res.status(404).json({
                    success: false,
                    message: 'Account not found',
                });
                return;
            }

            // Verify account belongs to user
            if (account.user_id !== userId) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied',
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: { account },
            });
        } catch (error: any) {
            logger.error('Get account error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch account',
            });
        }
    }

    /**
     * Verify account by account number (for transfers to other users)
     */
    async verifyAccount(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { accountNumber } = req.params;

            if (!accountNumber) {
                res.status(400).json({
                    success: false,
                    message: 'Account number is required',
                });
                return;
            }

            const account = await AccountModel.findByAccountNumber(accountNumber);

            if (!account) {
                res.status(404).json({
                    success: false,
                    message: 'Account not found',
                });
                return;
            }

            // Check if account is active
            if (account.status !== 'active') {
                res.status(400).json({
                    success: false,
                    message: 'Account is not active and cannot receive transfers',
                });
                return;
            }

            // Return limited account info (don't expose sensitive data)
            res.status(200).json({
                success: true,
                data: {
                    account: {
                        id: account.id,
                        account_number: account.account_number,
                        account_type: account.account_type,
                        status: account.status,
                        // Don't send balance or user_id for security
                    },
                },
            });
        } catch (error: any) {
            logger.error('Verify account error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to verify account',
            });
        }
    }

    /**
     * Get all accounts (banker/admin only)
     */
    async getAllAccounts(req: AuthRequest, res: Response): Promise<void> {
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

            const result = await AccountModel.findAll(page, limit);

            res.status(200).json({
                success: true,
                data: {
                    accounts: result.accounts,
                    total: result.total,
                    page,
                    limit,
                },
            });
        } catch (error: any) {
            logger.error('Get all accounts error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch accounts',
            });
        }
    }
}

export default new AccountController();
