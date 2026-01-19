import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import DepositModel from '../models/Deposit';
import AccountModel from '../models/Account';
import logger from '../utils/logger';

class DepositController {
    /**
     * Get all deposits for current user
     */
    async getMyDeposits(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const deposits = await DepositModel.findByUserId(userId);

            res.status(200).json({
                success: true,
                data: { deposits },
            });
        } catch (error: any) {
            logger.error('Get deposits error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch deposits',
            });
        }
    }

    /**
     * Create a new deposit
     */
    async createDeposit(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const { account_id, amount, tenure_months, auto_renew } = req.body;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            // Validate input
            if (!account_id || !amount || !tenure_months) {
                res.status(400).json({
                    success: false,
                    message: 'Account ID, amount, and tenure are required',
                });
                return;
            }

            if (amount <= 0) {
                res.status(400).json({
                    success: false,
                    message: 'Amount must be greater than 0',
                });
                return;
            }

            if (tenure_months < 6 || tenure_months > 120) {
                res.status(400).json({
                    success: false,
                    message: 'Tenure must be between 6 and 120 months',
                });
                return;
            }

            // Verify account ownership
            const account = await AccountModel.findById(account_id);
            if (!account || account.user_id !== userId) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied to this account',
                });
                return;
            }

            // Check sufficient balance
            const accountBalance = typeof account.balance === 'string'
                ? parseFloat(account.balance)
                : account.balance;

            if (accountBalance < amount) {
                res.status(400).json({
                    success: false,
                    message: 'Insufficient balance',
                });
                return;
            }

            // Create deposit
            const deposit = await DepositModel.create({
                account_id,
                user_id: userId,
                principal_amount: amount,
                tenure_months,
                auto_renew: auto_renew || false,
            });

            res.status(201).json({
                success: true,
                message: 'Deposit created successfully',
                data: { deposit },
            });
        } catch (error: any) {
            logger.error('Create deposit error:', error);
            logger.error('Error details:', {
                message: error.message,
                stack: error.stack,
                body: req.body,
            });
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to create deposit',
            });
        }
    }

    /**
     * Get deposit by ID
     */
    async getDepositById(req: AuthRequest, res: Response): Promise<void> {
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

            const deposit = await DepositModel.findById(id);

            if (!deposit) {
                res.status(404).json({
                    success: false,
                    message: 'Deposit not found',
                });
                return;
            }

            if (deposit.user_id !== userId) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied',
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: { deposit },
            });
        } catch (error: any) {
            logger.error('Get deposit error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch deposit',
            });
        }
    }

    /**
     * Break deposit early
     */
    async breakDeposit(req: AuthRequest, res: Response): Promise<void> {
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

            const deposit = await DepositModel.findById(id);

            if (!deposit) {
                res.status(404).json({
                    success: false,
                    message: 'Deposit not found',
                });
                return;
            }

            if (deposit.user_id !== userId) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied',
                });
                return;
            }

            if (deposit.status !== 'active') {
                res.status(400).json({
                    success: false,
                    message: 'Deposit is not active',
                });
                return;
            }

            const brokenDeposit = await DepositModel.breakDeposit(id);

            res.status(200).json({
                success: true,
                message: 'Deposit broken successfully',
                data: { deposit: brokenDeposit },
            });
        } catch (error: any) {
            logger.error('Break deposit error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to break deposit',
            });
        }
    }
}

export default new DepositController();
