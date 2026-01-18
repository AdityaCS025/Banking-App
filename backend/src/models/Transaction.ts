import { query, getClient } from '../config/database';
import logger from '../utils/logger';

export interface Transaction {
    id: string;
    account_id: string;
    type: 'deposit' | 'withdrawal' | 'transfer' | 'card_payment';
    amount: number;
    balance_before: number;
    balance_after: number;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    description?: string;
    reference_number: string;
    recipient_account?: string;
    recipient_name?: string;
    metadata?: any;
    requires_approval: boolean;
    approved_by?: string;
    approved_at?: Date;
    created_at: Date;
}

export interface CreateTransactionData {
    account_id: string;
    type: 'deposit' | 'withdrawal' | 'transfer' | 'card_payment';
    amount: number;
    description?: string;
    recipient_account?: string;
    recipient_name?: string;
    metadata?: any;
}

class TransactionModel {
    /**
     * Create a new transaction (atomic with balance update)
     */
    async create(transactionData: CreateTransactionData): Promise<Transaction> {
        const client = await getClient();

        try {
            await client.query('BEGIN');

            // Get current account balance
            const accountResult = await client.query(
                `SELECT balance, status FROM accounts WHERE id = $1 FOR UPDATE`,
                [transactionData.account_id]
            );

            if (!accountResult.rows[0]) {
                throw new Error('Account not found');
            }

            if (accountResult.rows[0].status !== 'active') {
                throw new Error('Account is not active');
            }

            const currentBalance = parseFloat(accountResult.rows[0].balance);
            let newBalance = currentBalance;

            // Calculate new balance based on transaction type
            if (transactionData.type === 'deposit') {
                newBalance = currentBalance + transactionData.amount;
            } else if (transactionData.type === 'withdrawal' || transactionData.type === 'transfer' || transactionData.type === 'card_payment') {
                newBalance = currentBalance - transactionData.amount;

                if (newBalance < 0) {
                    throw new Error('Insufficient balance');
                }
            }

            // Check if approval is required
            const approvalThreshold = parseFloat(process.env.TRANSACTION_APPROVAL_THRESHOLD || '100000');
            const requiresApproval = transactionData.amount > approvalThreshold;
            const status = requiresApproval ? 'pending' : 'completed';

            // Create transaction
            const transactionResult = await client.query(
                `INSERT INTO transactions (
          account_id, type, amount, balance_before, balance_after,
          status, description, recipient_account, recipient_name,
          metadata, requires_approval
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
                [
                    transactionData.account_id,
                    transactionData.type,
                    transactionData.amount,
                    currentBalance,
                    newBalance,
                    status,
                    transactionData.description || null,
                    transactionData.recipient_account || null,
                    transactionData.recipient_name || null,
                    transactionData.metadata ? JSON.stringify(transactionData.metadata) : null,
                    requiresApproval,
                ]
            );

            // Update account balance only if transaction is completed
            if (status === 'completed') {
                await client.query(
                    `UPDATE accounts SET balance = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
                    [newBalance, transactionData.account_id]
                );
            }

            await client.query('COMMIT');

            logger.info(`Transaction created: ${transactionResult.rows[0].id}`);
            return transactionResult.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Transaction creation failed:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Find transaction by ID
     */
    async findById(id: string): Promise<Transaction | null> {
        const result = await query(`SELECT * FROM transactions WHERE id = $1`, [id]);
        return result.rows[0] || null;
    }

    /**
     * Find transactions by account ID
     */
    async findByAccountId(
        accountId: string,
        page: number = 1,
        limit: number = 10
    ): Promise<{ transactions: Transaction[]; total: number }> {
        const offset = (page - 1) * limit;

        const [transactionsResult, countResult] = await Promise.all([
            query(
                `SELECT * FROM transactions
         WHERE account_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
                [accountId, limit, offset]
            ),
            query(`SELECT COUNT(*) FROM transactions WHERE account_id = $1`, [accountId]),
        ]);

        return {
            transactions: transactionsResult.rows,
            total: parseInt(countResult.rows[0].count),
        };
    }

    /**
     * Approve transaction
     */
    async approve(id: string, approvedBy: string): Promise<Transaction | null> {
        const client = await getClient();

        try {
            await client.query('BEGIN');

            // Get transaction
            const txResult = await client.query(
                `SELECT * FROM transactions WHERE id = $1 FOR UPDATE`,
                [id]
            );

            if (!txResult.rows[0]) {
                throw new Error('Transaction not found');
            }

            const transaction = txResult.rows[0];

            if (transaction.status !== 'pending') {
                throw new Error('Transaction is not pending');
            }

            // Update account balance
            await client.query(
                `UPDATE accounts SET balance = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
                [transaction.balance_after, transaction.account_id]
            );

            // Update transaction status
            const result = await client.query(
                `UPDATE transactions
         SET status = 'approved', approved_by = $1, approved_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
                [approvedBy, id]
            );

            await client.query('COMMIT');

            logger.info(`Transaction approved: ${id} by ${approvedBy}`);
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Transaction approval failed:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Reject transaction
     */
    async reject(id: string, approvedBy: string): Promise<Transaction | null> {
        const result = await query(
            `UPDATE transactions
       SET status = 'rejected', approved_by = $1, approved_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
            [approvedBy, id]
        );

        logger.info(`Transaction rejected: ${id} by ${approvedBy}`);
        return result.rows[0] || null;
    }

    /**
     * Get pending transactions (admin)
     */
    async getPendingTransactions(
        page: number = 1,
        limit: number = 10
    ): Promise<{ transactions: any[]; total: number }> {
        const offset = (page - 1) * limit;

        const [transactionsResult, countResult] = await Promise.all([
            query(
                `SELECT t.*, a.account_number, u.full_name, u.email
         FROM transactions t
         JOIN accounts a ON t.account_id = a.id
         JOIN users u ON a.user_id = u.id
         WHERE t.status = 'pending' AND t.requires_approval = true
         ORDER BY t.created_at DESC
         LIMIT $1 OFFSET $2`,
                [limit, offset]
            ),
            query(
                `SELECT COUNT(*) FROM transactions
         WHERE status = 'pending' AND requires_approval = true`
            ),
        ]);

        return {
            transactions: transactionsResult.rows,
            total: parseInt(countResult.rows[0].count),
        };
    }

    /**
     * Get transaction history with filters
     */
    async getHistory(
        accountId: string,
        filters?: {
            type?: string;
            startDate?: Date;
            endDate?: Date;
        },
        page: number = 1,
        limit: number = 10
    ): Promise<{ transactions: Transaction[]; total: number }> {
        const offset = (page - 1) * limit;
        const conditions: string[] = ['account_id = $1'];
        const params: any[] = [accountId];
        let paramCount = 2;

        if (filters?.type) {
            conditions.push(`type = $${paramCount}`);
            params.push(filters.type);
            paramCount++;
        }

        if (filters?.startDate) {
            conditions.push(`created_at >= $${paramCount}`);
            params.push(filters.startDate);
            paramCount++;
        }

        if (filters?.endDate) {
            conditions.push(`created_at <= $${paramCount}`);
            params.push(filters.endDate);
            paramCount++;
        }

        const whereClause = conditions.join(' AND ');

        const [transactionsResult, countResult] = await Promise.all([
            query(
                `SELECT * FROM transactions
         WHERE ${whereClause}
         ORDER BY created_at DESC
         LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
                [...params, limit, offset]
            ),
            query(`SELECT COUNT(*) FROM transactions WHERE ${whereClause}`, params),
        ]);

        return {
            transactions: transactionsResult.rows,
            total: parseInt(countResult.rows[0].count),
        };
    }
}

export default new TransactionModel();
