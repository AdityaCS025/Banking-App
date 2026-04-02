import { query, getClient } from '../config/database';
import crypto from 'crypto';
import logger from '../utils/logger';

export interface Card {
    id: string;
    account_id: string;
    user_id: string;
    card_number: string;
    card_type: string;
    cardholder_name?: string;
    card_holder_name?: string;
    status: string;
    spending_limit: number;
    daily_limit?: number;
    valid_from?: Date;
    valid_thru?: Date;
    expiry_date?: Date;
    current_spent?: number;
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
        cardNumber += crypto.randomInt(0, 10).toString();
    }

    return cardNumber;
}

/**
 * Generate random CVV (3 digits)
 */
function generateCVV(): string {
    return crypto.randomInt(100, 1000).toString();
}

class CardModel {
    private getTableName(): 'cards' | 'virtual_cards' {
        const table = process.env.CARD_TABLE || 'virtual_cards';
        return table === 'cards' ? 'cards' : 'virtual_cards';
    }

    private mapCardType(cardType: 'debit' | 'credit', table: 'cards' | 'virtual_cards'): string {
        if (table === 'cards') {
            return cardType;
        }

        return cardType === 'credit' ? 'premium' : 'basic';
    }

    /**
     * Create a new card
     */
    async create(cardData: CreateCardData): Promise<Card> {
        const table = this.getTableName();
        const cardNumber = generateCardNumber();
        const cvv = generateCVV();
        const validFrom = new Date();
        const validThru = new Date();
        validThru.setFullYear(validThru.getFullYear() + 3); // Valid for 3 years
        const mappedCardType = this.mapCardType(cardData.card_type, table);

        if (table === 'cards') {
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
                    mappedCardType,
                    cardData.cardholder_name,
                    cardData.spending_limit ?? 50000,
                    cardData.daily_limit ?? 10000,
                    validFrom,
                    validThru,
                    cvv,
                ]
            );

            logger.info(`Card created: ${cardNumber} for user ${cardData.user_id}`);
            return result.rows[0];
        }

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
                mappedCardType,
                cardData.cardholder_name,
                cardData.spending_limit ?? 50000,
                cvv,
                validThru,
            ]
        );

        logger.info(`Card created: ${cardNumber} for user ${cardData.user_id}`);
        return result.rows[0];
    }

    /**
     * Find all cards for a user
     */
    async findByUserId(userId: string): Promise<Card[]> {
        const table = this.getTableName();
        const result = await query(
            `SELECT * FROM ${table} WHERE user_id = $1 ORDER BY created_at DESC`,
            [userId]
        );
        return result.rows;
    }

    /**
     * Find card by ID
     */
    async findById(id: string): Promise<Card | null> {
        const table = this.getTableName();
        const result = await query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
        return result.rows[0] || null;
    }

    /**
     * Find cards by account ID
     */
    async findByAccountId(accountId: string): Promise<Card[]> {
        const table = this.getTableName();
        const result = await query(
            `SELECT * FROM ${table} WHERE account_id = $1 ORDER BY created_at DESC`,
            [accountId]
        );
        return result.rows;
    }

    /**
     * Update card status (freeze/unfreeze/block)
     */
    async updateStatus(id: string, status: 'active' | 'frozen' | 'blocked'): Promise<Card | null> {
        const table = this.getTableName();
        const result = await query(
            `UPDATE ${table} SET status = $1, updated_at = CURRENT_TIMESTAMP
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
        spendingLimit: number,
        dailyLimit?: number
    ): Promise<Card | null> {
        const table = this.getTableName();

        if (table === 'virtual_cards') {
            const result = await query(
                `UPDATE virtual_cards SET spending_limit = $1, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $2
                 RETURNING *`,
                [spendingLimit, id]
            );

            if (result.rows[0]) {
                logger.info(`Card ${id} limit updated`);
            }

            return result.rows[0] || null;
        }

        const values: any[] = [spendingLimit];
        let sets = 'spending_limit = $1';
        let whereParam = 2;

        if (dailyLimit !== undefined) {
            values.push(dailyLimit);
            sets += ', daily_limit = $2';
            whereParam = 3;
        }

        values.push(id);

        const result = await query(
            `UPDATE cards SET ${sets}, updated_at = CURRENT_TIMESTAMP
             WHERE id = $${whereParam}
             RETURNING *`,
            values
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
        const table = this.getTableName();
        const result = await query(`DELETE FROM ${table} WHERE id = $1`, [id]);

        if (result.rowCount && result.rowCount > 0) {
            logger.info(`Card ${id} deleted`);
            return true;
        }

        return false;
    }
}

export default new CardModel();
