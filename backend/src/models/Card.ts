import { query, getClient } from '../config/database';
import logger from '../utils/logger';

export interface Card {
    id: string;
    account_id: string;
    user_id: string;
    card_number: string;
    card_type: 'basic' | 'premium' | 'elite';
    card_holder_name: string;
    status: 'pending' | 'active' | 'frozen' | 'expired' | 'cancelled';
    spending_limit: number;
    current_spent: number;
    expiry_date: Date;
    cvv: string;
    issued_at: Date | null;
    created_at: Date;
    updated_at: Date;
}

export interface CreateCardData {
    account_id: string;
    user_id: string;
    card_type: 'basic' | 'premium' | 'elite';
    card_holder_name: string;
    spending_limit?: number;
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
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 3); // Valid for 3 years

        const result = await query(
            `INSERT INTO virtual_cards (
                account_id, user_id, card_number, card_type, card_holder_name,
                spending_limit, cvv, expiry_date
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
            [
                cardData.account_id,
                cardData.user_id,
                cardNumber,
                cardData.card_type || 'basic',
                cardData.card_holder_name,
                cardData.spending_limit || 50000,
                cvv,
                expiryDate,
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
            `SELECT * FROM virtual_cards WHERE user_id = $1 ORDER BY created_at DESC`,
            [userId]
        );
        return result.rows;
    }

    /**
     * Find card by ID
     */
    async findById(id: string): Promise<Card | null> {
        const result = await query(`SELECT * FROM virtual_cards WHERE id = $1`, [id]);
        return result.rows[0] || null;
    }

    /**
     * Find cards by account ID
     */
    async findByAccountId(accountId: string): Promise<Card[]> {
        const result = await query(
            `SELECT * FROM virtual_cards WHERE account_id = $1 ORDER BY created_at DESC`,
            [accountId]
        );
        return result.rows;
    }

    /**
     * Update card status (freeze/unfreeze/block)
     */
    async updateStatus(id: string, status: 'pending' | 'active' | 'frozen' | 'expired' | 'cancelled'): Promise<Card | null> {
        const result = await query(
            `UPDATE virtual_cards SET status = $1, updated_at = CURRENT_TIMESTAMP
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
     * Update spending limit
     */
    async updateLimits(
        id: string,
        spendingLimit: number
    ): Promise<Card | null> {
        const result = await query(
            `UPDATE virtual_cards SET 
                spending_limit = $1,
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING *`,
            [spendingLimit, id]
        );

        if (result.rows[0]) {
            logger.info(`Card ${id} limit updated`);
        }

        return result.rows[0] || null;
    }

    /**
     * Delete card
     */
    async delete(id: string): Promise<boolean> {
        const result = await query(`DELETE FROM virtual_cards WHERE id = $1`, [id]);

        if (result.rowCount && result.rowCount > 0) {
            logger.info(`Card ${id} deleted`);
            return true;
        }

        return false;
    }
}

export default new CardModel();
