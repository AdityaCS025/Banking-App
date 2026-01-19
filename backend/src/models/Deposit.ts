import { query } from '../config/database';
import logger from '../utils/logger';

export interface Deposit {
    id: string;
    account_id: string;
    user_id: string;
    principal_amount: number;
    interest_rate: number;
    tenure_months: number;
    maturity_amount: number;
    maturity_date: Date;
    status: 'active' | 'matured' | 'withdrawn';
    auto_renew: boolean;
    created_at: Date;
    matured_at: Date | null;
}

export interface CreateDepositData {
    account_id: string;
    user_id: string;
    principal_amount: number;
    tenure_months: number;
    auto_renew?: boolean;
}

/**
 * Interest rates based on tenure (in months)
 */
const getInterestRate = (tenureMonths: number): number => {
    if (tenureMonths >= 60) return 7.5; // 5+ years
    if (tenureMonths >= 36) return 7.0; // 3-5 years
    if (tenureMonths >= 24) return 6.5; // 2-3 years
    if (tenureMonths >= 12) return 6.0; // 1-2 years
    return 5.5; // 6-12 months
};

/**
 * Calculate maturity amount for Fixed Deposit
 * Formula: A = P(1 + r/n)^(nt)
 * Where: P = Principal, r = rate, n = compounding frequency (quarterly = 4), t = time in years
 */
const calculateFDMaturity = (principal: number, rate: number, months: number): number => {
    const years = months / 12;
    const n = 4; // Quarterly compounding
    const r = rate / 100;
    const maturity = principal * Math.pow(1 + r / n, n * years);
    return Math.round(maturity * 100) / 100;
};

class DepositModel {
    /**
     * Create a new deposit
     */
    async create(depositData: CreateDepositData): Promise<Deposit> {
        const interestRate = getInterestRate(depositData.tenure_months);
        const maturityAmount = calculateFDMaturity(depositData.principal_amount, interestRate, depositData.tenure_months);

        const maturityDate = new Date();
        maturityDate.setMonth(maturityDate.getMonth() + depositData.tenure_months);

        const result = await query(
            `INSERT INTO deposits (
                account_id, user_id, principal_amount, tenure_months,
                interest_rate, maturity_amount, maturity_date, auto_renew
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
            [
                depositData.account_id,
                depositData.user_id,
                depositData.principal_amount,
                depositData.tenure_months,
                interestRate,
                maturityAmount,
                maturityDate,
                depositData.auto_renew || false,
            ]
        );

        logger.info(`Deposit created: ${result.rows[0].id} for user ${depositData.user_id}`);
        return result.rows[0];
    }

    /**
     * Find all deposits for a user
     */
    async findByUserId(userId: string): Promise<Deposit[]> {
        const result = await query(
            `SELECT * FROM deposits WHERE user_id = $1 ORDER BY created_at DESC`,
            [userId]
        );
        return result.rows;
    }

    /**
     * Find deposit by ID
     */
    async findById(id: string): Promise<Deposit | null> {
        const result = await query(`SELECT * FROM deposits WHERE id = $1`, [id]);
        return result.rows[0] || null;
    }

    /**
     * Break/withdraw deposit early
     */
    async breakDeposit(id: string): Promise<Deposit | null> {
        const result = await query(
            `UPDATE deposits SET 
                status = 'withdrawn',
                matured_at = CURRENT_TIMESTAMP
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows[0]) {
            logger.info(`Deposit ${id} withdrawn`);
        }

        return result.rows[0] || null;
    }

    /**
     * Calculate interest for a deposit
     */
    calculateInterest(principal: number, rate: number, months: number): number {
        return calculateFDMaturity(principal, rate, months) - principal;
    }
}

export default new DepositModel();
