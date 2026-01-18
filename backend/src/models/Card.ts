import { query, getClient } from '../config/database';
import logger from '../utils/logger';

export interface Card {
    id: string;
    account_id: string;
    user_id: string;
    card_number: string;
    card_type: 'debit' | 'credit';
    cardholder_name: string;
    status: 'active' | 'frozen' | 'blocked';
    spending_limit: number;
    daily_limit: number;
    valid_from: Date;
    valid_thru: Date;
    cvv: string;
    created_at: Date;
    updated_at: Date;
}

export interface CreateCardData {
    account_id: string;
    user_id: string;
    card_type: 'debit' | 'credit';
    cardholder_name: string;
    spending_limit?: number;
    daily_limit?: number;
}

/**
 * Generate random card number (16 digits)
 */
function generateCardNumber(): string {
    // Generate 16 digit card number starting with 4 (Visa-like)
    const prefix = '4';
    let cardNumber = prefix;

    for (let i = 0; i < 15; i++) {
        cardNumber += Math.floor(Math.random() * 10);
    }

    return cardNumber;
}

/**
 * Generate random CVV (3 digits)
 */
function generateCVV(): string {
    return Math.floor(100 + Math.random() * 900).toString();
}

class CardModel {
    /**
     * Create a new card
     */
    async create(cardData: CreateCardData): Promise<Card> {
        const cardNumber = generateCardNumber();
        const cvv = generateCVV();
        const validFrom = new Date();
        const validThru = new Date();
        validThru.setFullYear(validThru.getFullYear() + 3); // Valid for 3 years

        const result = await query(
            `INSERT INTO cards (
                account_id, user_id, card_number, card_type, cardholder_name,
                spending_limit, daily_limit, valid_from, valid_thru, cvv
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *`,
            [
                cardData.account_id,
                cardData.user_id,
                cardNumber,
                cardData.card_type,
                cardData.cardholder_name,
                cardData.spending_limit || 50000,
                cardData.daily_limit || 10000,
                validFrom,
                validThru,
                cvv,
            ]
        );

        logger.info(`Card created: ${cardNumber} for user ${cardData.user_id}`);
        return result.rows[0];
    }

    /**
     * Find all cards for a user
     */
    async findByUserId(userId: string): Promise<Card[]> {
        const result = await query(
            `SELECT * FROM cards WHERE user_id = $1 ORDER BY created_at DESC`,
            [userId]
        );
        return result.rows;
    }

    /**
     * Find card by ID
     */
    async findById(id: string): Promise<Card | null> {
        const result = await query(`SELECT * FROM cards WHERE id = $1`, [id]);
        return result.rows[0] || null;
    }

    /**
     * Find cards by account ID
     */
    async findByAccountId(accountId: string): Promise<Card[]> {
        const result = await query(
            `SELECT * FROM cards WHERE account_id = $1 ORDER BY created_at DESC`,
            [accountId]
        );
        return result.rows;
    }

    /**
     * Update card status (freeze/unfreeze/block)
     */
    async updateStatus(id: string, status: 'active' | 'frozen' | 'blocked'): Promise<Card | null> {
        const result = await query(
            `UPDATE cards SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING *`,
            [status, id]
        );

        if (result.rows[0]) {
            logger.info(`Card ${id} status updated to ${status}`);
        }

        return result.rows[0] || null;
    }

    /**
     * Update spending limits
     */
    async updateLimits(
        id: string,
        spendingLimit: number,
        dailyLimit: number
    ): Promise<Card | null> {
        const result = await query(
            `UPDATE cards SET 
                spending_limit = $1,
                daily_limit = $2,
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $3
             RETURNING *`,
            [spendingLimit, dailyLimit, id]
        );

        if (result.rows[0]) {
            logger.info(`Card ${id} limits updated`);
        }

        return result.rows[0] || null;
    }

    /**
     * Delete card
     */
    async delete(id: string): Promise<boolean> {
        const result = await query(`DELETE FROM cards WHERE id = $1`, [id]);

        if (result.rowCount && result.rowCount > 0) {
            logger.info(`Card ${id} deleted`);
            return true;
        }

        return false;
    }
}

export default new CardModel();
