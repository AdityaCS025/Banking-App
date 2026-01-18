import { query, getClient } from '../config/database';
import logger from '../utils/logger';
import { generateAccountNumber } from '../utils/helpers';

export interface Account {
    id: string;
    user_id: string;
    account_number: string;
    account_type: string;
    balance: number;
    currency: string;
    status: 'pending' | 'active' | 'suspended' | 'closed';
    ifsc_code: string;
    branch: string;
    created_at: Date;
    updated_at: Date;
}

export interface CreateAccountData {
    user_id: string;
    account_type: 'savings' | 'current';
}

class AccountModel {
    /**
     * Get database client for transactions
     */
    static async getClient() {
        return getClient();
    }

    /**
     * Create a new account
     */
    async create(accountData: CreateAccountData): Promise<Account> {
        const accountNumber = generateAccountNumber();

        const result = await query(
            `INSERT INTO accounts (user_id, account_number, account_type, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [accountData.user_id, accountNumber, accountData.account_type, 'active']
        );

        logger.info(`Account created: ${result.rows[0].id} for user ${accountData.user_id}`);
        return result.rows[0];
    }

    /**
     * Find account by ID
     */
    async findById(id: string): Promise<Account | null> {
        const result = await query(`SELECT * FROM accounts WHERE id = $1`, [id]);
        return result.rows[0] || null;
    }

    /**
     * Find account by account number
     */
    async findByAccountNumber(accountNumber: string): Promise<Account | null> {
        const result = await query(`SELECT * FROM accounts WHERE account_number = $1`, [accountNumber]);
        return result.rows[0] || null;
    }

    /**
     * Find all accounts for a user
     */
    async findByUserId(userId: string): Promise<Account[]> {
        const result = await query(
            `SELECT * FROM accounts WHERE user_id = $1 ORDER BY created_at DESC`,
            [userId]
        );
        return result.rows;
    }

    /**
     * Update account balance (use with caution - prefer transactions)
     */
    async updateBalance(id: string, newBalance: number): Promise<Account | null> {
        const result = await query(
            `UPDATE accounts SET balance = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
            [newBalance, id]
        );

        logger.info(`Account balance updated: ${id} to ${newBalance}`);
        return result.rows[0] || null;
    }

    /**
     * Activate account
     */
    async activate(id: string): Promise<Account | null> {
        const result = await query(
            `UPDATE accounts SET status = 'active', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
            [id]
        );

        logger.info(`Account activated: ${id}`);
        return result.rows[0] || null;
    }

    /**
     * Suspend account
     */
    async suspend(id: string): Promise<Account | null> {
        const result = await query(
            `UPDATE accounts SET status = 'suspended', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
            [id]
        );

        logger.info(`Account suspended: ${id}`);
        return result.rows[0] || null;
    }

    /**
     * Close account
     */
    async close(id: string): Promise<Account | null> {
        const result = await query(
            `UPDATE accounts SET status = 'closed', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
            [id]
        );

        logger.info(`Account closed: ${id}`);
        return result.rows[0] || null;
    }

    /**
     * Get account with user details
     */
    async getAccountWithUser(accountId: string): Promise<any> {
        const result = await query(
            `SELECT a.*, u.full_name, u.email, u.phone, u.kyc_status
       FROM accounts a
       JOIN users u ON a.user_id = u.id
       WHERE a.id = $1`,
            [accountId]
        );

        return result.rows[0] || null;
    }

    /**
     * Get all accounts (admin)
     */
    async findAll(page: number = 1, limit: number = 10): Promise<{ accounts: any[]; total: number }> {
        const offset = (page - 1) * limit;

        const [accountsResult, countResult] = await Promise.all([
            query(
                `SELECT a.*, u.full_name, u.email
         FROM accounts a
         JOIN users u ON a.user_id = u.id
         ORDER BY a.created_at DESC
         LIMIT $1 OFFSET $2`,
                [limit, offset]
            ),
            query(`SELECT COUNT(*) FROM accounts`),
        ]);

        return {
            accounts: accountsResult.rows,
            total: parseInt(countResult.rows[0].count),
        };
    }
}

export default new AccountModel();
