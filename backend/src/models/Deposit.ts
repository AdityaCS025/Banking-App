import { query } from '../config/database';
import logger from '../utils/logger';

export interface Deposit {
    id: string;
    account_id: string;
    user_id: string;
    deposit_type: 'fixed' | 'recurring';
    amount: number;
    tenure_months: number;
    interest_rate: number;
    maturity_amount: number;
    monthly_installment?: number;
    start_date: Date;
    maturity_date: Date;
    status: 'active' | 'matured' | 'broken';
    created_at: Date;
    updated_at: Date;
}

export interface CreateDepositData {
    account_id: string;
    user_id: string;
    deposit_type: 'fixed' | 'recurring';
    amount: number;
    tenure_months: number;
}

/**
 * Interest rates based on tenure (in months)
 */
const getInterestRate = (tenureMonths: number, depositType: 'fixed' | 'recurring'): number => {
    if (depositType === 'fixed') {
        if (tenureMonths >= 60) return 7.5; // 5+ years
        if (tenureMonths >= 36) return 7.0; // 3-5 years
        if (tenureMonths >= 24) return 6.5; // 2-3 years
        if (tenureMonths >= 12) return 6.0; // 1-2 years
        return 5.5; // 6-12 months
    } else {
        // RD rates (slightly lower than FD)
        if (tenureMonths >= 60) return 7.0;
        if (tenureMonths >= 36) return 6.5;
        if (tenureMonths >= 24) return 6.0;
        if (tenureMonths >= 12) return 5.5;
        return 5.0;
    }
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

/**
 * Calculate maturity amount for Recurring Deposit
 * Formula: M = P * n * [(1 + r/400) * (n + 1) / 2]
 * Where: P = Monthly installment, n = number of months, r = rate
 */
const calculateRDMaturity = (monthlyInstallment: number, rate: number, months: number): number => {
    const r = rate / 100;
    const maturity = monthlyInstallment * months * (1 + (r / 4) * ((months + 1) / 24));
    return Math.round(maturity * 100) / 100;
};

class DepositModel {
    /**
     * Create a new deposit
     */
    async create(depositData: CreateDepositData): Promise<Deposit> {
        const interestRate = getInterestRate(depositData.tenure_months, depositData.deposit_type);

        let maturityAmount: number;
        let monthlyInstallment: number | null = null;

        if (depositData.deposit_type === 'fixed') {
            maturityAmount = calculateFDMaturity(depositData.amount, interestRate, depositData.tenure_months);
        } else {
            // For RD, amount is the monthly installment
            monthlyInstallment = depositData.amount;
            maturityAmount = calculateRDMaturity(depositData.amount, interestRate, depositData.tenure_months);
        }

        const startDate = new Date();
        const maturityDate = new Date();
        maturityDate.setMonth(maturityDate.getMonth() + depositData.tenure_months);

        const result = await query(
            `INSERT INTO deposits (
                account_id, user_id, deposit_type, amount, tenure_months,
                interest_rate, maturity_amount, monthly_installment,
                start_date, maturity_date
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *`,
            [
                depositData.account_id,
                depositData.user_id,
                depositData.deposit_type,
                depositData.amount,
                depositData.tenure_months,
                interestRate,
                maturityAmount,
                monthlyInstallment,
                startDate,
                maturityDate,
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
     * Break deposit early
     */
    async breakDeposit(id: string): Promise<Deposit | null> {
        const result = await query(
            `UPDATE deposits SET 
                status = 'broken',
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows[0]) {
            logger.info(`Deposit ${id} broken`);
        }

        return result.rows[0] || null;
    }

    /**
     * Calculate interest for a deposit
     */
    calculateInterest(depositType: 'fixed' | 'recurring', amount: number, rate: number, months: number): number {
        if (depositType === 'fixed') {
            return calculateFDMaturity(amount, rate, months) - amount;
        } else {
            return calculateRDMaturity(amount, rate, months) - (amount * months);
        }
    }
}

export default new DepositModel();
