import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import TransactionModel from '../models/Transaction';
import AccountModel from '../models/Account';
import { getClient } from '../config/database';
import logger from '../utils/logger';

class TransactionController {
    /**
     * Get all transactions for current user's accounts
     */
    async getMyTransactions(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const { account_id, page = 1, limit = 10 } = req.query;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            // Get user's accounts
            const accounts = await AccountModel.findByUserId(userId);

            if (accounts.length === 0) {
                res.status(200).json({
                    success: true,
                    data: {
                        transactions: [],
                        total: 0,
                    },
                });
                return;
            }

            // If specific account requested, verify ownership
            if (account_id) {
                const accountOwned = accounts.some(acc => acc.id === account_id);
                if (!accountOwned) {
                    res.status(403).json({
                        success: false,
                        message: 'Access denied',
                    });
                    return;
                }

                const result = await TransactionModel.findByAccountId(
                    account_id as string,
                    parseInt(page as string),
                    parseInt(limit as string)
                );

                res.status(200).json({
                    success: true,
                    data: result,
                });
                return;
            }

            // Get transactions for all user accounts
            const allTransactions = await Promise.all(
                accounts.map(acc =>
                    TransactionModel.findByAccountId(acc.id, 1, 100)
                )
            );

            const transactions = allTransactions
                .flatMap(result => result.transactions)
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, parseInt(limit as string));

            res.status(200).json({
                success: true,
                data: {
                    transactions,
                    total: transactions.length,
                },
            });
        } catch (error: any) {
            logger.error('Get transactions error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch transactions',
            });
        }
    }

    /**
     * Get transaction statistics (income/expenses)
     */
    async getStats(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            // Get user's accounts
            const accounts = await AccountModel.findByUserId(userId);

            if (accounts.length === 0) {
                res.status(200).json({
                    success: true,
                    data: {
                        income: 0,
                        expenses: 0,
                    },
                });
                return;
            }

            // Get all transactions for user accounts
            const allTransactions = await Promise.all(
                accounts.map(acc => TransactionModel.findByAccountId(acc.id, 1, 1000))
            );

            const transactions = allTransactions.flatMap(result => result.transactions);

            // Calculate income and expenses
            let income = 0;
            let expenses = 0;

            transactions.forEach(tx => {
                if (tx.status === 'completed' || tx.status === 'approved') {
                    if (tx.type === 'deposit') {
                        income += parseFloat(tx.amount.toString());
                    } else if (tx.type === 'withdrawal' || tx.type === 'transfer' || tx.type === 'card_payment') {
                        expenses += parseFloat(tx.amount.toString());
                    }
                }
            });

            res.status(200).json({
                success: true,
                data: {
                    income,
                    expenses,
                },
            });
        } catch (error: any) {
            logger.error('Get stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch statistics',
            });
        }
    }

    /**
     * Get transaction by ID
     */
    async getTransactionById(req: AuthRequest, res: Response): Promise<void> {
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

            const transaction = await TransactionModel.findById(id);

            if (!transaction) {
                res.status(404).json({
                    success: false,
                    message: 'Transaction not found',
                });
                return;
            }

            // Verify transaction belongs to user's account
            const account = await AccountModel.findById(transaction.account_id);
            if (!account || account.user_id !== userId) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied',
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: { transaction },
            });
        } catch (error: any) {
            logger.error('Get transaction error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch transaction',
            });
        }
    }

    /**
     * Deposit money into account
     */
    async deposit(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const { account_id, amount, description } = req.body;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            // Validate amount
            if (!amount || amount <= 0) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid amount',
                });
                return;
            }

            // Verify account ownership
            const account = await AccountModel.findById(account_id);
            if (!account || account.user_id !== userId) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied',
                });
                return;
            }

            // Create deposit transaction
            const transaction = await TransactionModel.create({
                account_id,
                type: 'deposit',
                amount,
                description: description || 'Cash Deposit',
            });

            res.status(201).json({
                success: true,
                message: 'Deposit successful',
                data: { transaction },
            });
        } catch (error: any) {
            logger.error('Deposit error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to process deposit',
            });
        }
    }

    /**
     * Withdraw money from account
     */
    async withdraw(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const { account_id, amount, description } = req.body;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            // Validate amount
            if (!amount || amount <= 0) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid amount',
                });
                return;
            }

            // Verify account ownership
            const account = await AccountModel.findById(account_id);
            if (!account || account.user_id !== userId) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied',
                });
                return;
            }

            // Check sufficient balance
            if (parseFloat(account.balance as any) < amount) {
                res.status(400).json({
                    success: false,
                    message: 'Insufficient balance',
                });
                return;
            }

            // Create withdrawal transaction
            const transaction = await TransactionModel.create({
                account_id,
                type: 'withdrawal',
                amount,
                description: description || 'Cash Withdrawal',
            });

            res.status(201).json({
                success: true,
                message: 'Withdrawal successful',
                data: { transaction },
            });
        } catch (error: any) {
            logger.error('Withdrawal error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to process withdrawal',
            });
        }
    }

    /**
     * Transfer money between accounts (ATOMIC)
     */
    async transfer(req: AuthRequest, res: Response): Promise<void> {
        const client = await getClient();

        try {
            const userId = req.user?.id;
            const { from_account_id, to_account_id, amount, description } = req.body;

            if (!userId) {
                client.release();
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            // Validate amount
            if (!amount || amount <= 0) {
                client.release();
                res.status(400).json({
                    success: false,
                    message: 'Invalid amount',
                });
                return;
            }

            // Start atomic transaction
            await client.query('BEGIN');

            // Lock and verify from account
            logger.info(`Fetching from account: ${from_account_id}`);
            const fromAccountResult = await client.query(
                `SELECT * FROM accounts WHERE id = $1 FOR UPDATE`,
                [from_account_id]
            );
            logger.info(`From account result: ${fromAccountResult.rows.length} rows`);

            if (!fromAccountResult.rows[0]) {
                throw new Error('Source account not found');
            }

            const fromAccount = fromAccountResult.rows[0];

            if (fromAccount.user_id !== userId) {
                throw new Error('Access denied to source account');
            }

            if (fromAccount.status !== 'active') {
                throw new Error('Source account is not active');
            }

            // Lock and verify to account
            const toAccountResult = await client.query(
                `SELECT * FROM accounts WHERE id = $1 FOR UPDATE`,
                [to_account_id]
            );

            if (!toAccountResult.rows[0]) {
                throw new Error('Destination account not found');
            }

            const toAccount = toAccountResult.rows[0];

            if (toAccount.status !== 'active') {
                throw new Error('Destination account is not active');
            }

            // Check sufficient balance
            const currentBalance = parseFloat(fromAccount.balance);
            if (currentBalance < amount) {
                throw new Error('Insufficient balance');
            }

            // Calculate new balances
            const newFromBalance = currentBalance - amount;
            const newToBalance = parseFloat(toAccount.balance) + amount;

            // Update from account balance
            await client.query(
                `UPDATE accounts SET balance = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
                [newFromBalance, from_account_id]
            );

            // Update to account balance
            await client.query(
                `UPDATE accounts SET balance = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
                [newToBalance, to_account_id]
            );

            // Create debit transaction record
            const debitResult = await client.query(
                `INSERT INTO transactions (
                    account_id, type, amount, balance_before, balance_after,
                    status, description, recipient_account, recipient_name
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *`,
                [
                    from_account_id,
                    'transfer',
                    amount,
                    currentBalance,
                    newFromBalance,
                    'completed',
                    description || `Transfer to ${toAccount.account_number}`,
                    toAccount.account_number,
                    toAccount.user_id === userId ? 'Own Account' : 'External Account',
                ]
            );

            // Create credit transaction record
            await client.query(
                `INSERT INTO transactions (
                    account_id, type, amount, balance_before, balance_after,
                    status, description
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    to_account_id,
                    'deposit',
                    amount,
                    parseFloat(toAccount.balance),
                    newToBalance,
                    'completed',
                    description || `Transfer from ${fromAccount.account_number}`,
                ]
            );

            // Commit transaction
            await client.query('COMMIT');

            logger.info(`Transfer completed: ${amount} from ${from_account_id} to ${to_account_id}`);

            res.status(201).json({
                success: true,
                message: 'Transfer successful',
                data: { transaction: debitResult.rows[0] },
            });
        } catch (error: any) {
            // Rollback on any error
            await client.query('ROLLBACK');
            logger.error('Transfer error:', error);

            res.status(500).json({
                success: false,
                message: error.message || 'Failed to process transfer',
            });
        } finally {
            client.release();
        }
    }
}

export default new TransactionController();
