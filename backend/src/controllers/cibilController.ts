import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import pool from '../config/database';
import logger from '../utils/logger';

/**
 * Get user's latest CIBIL score
 */
export const getCibilScore = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
            return;
        }

        // Fetch latest CIBIL score
        const result = await pool.query(
            `SELECT score, score_date, factors 
             FROM credit_scores 
             WHERE user_id = $1 
             ORDER BY score_date DESC 
             LIMIT 1`,
            [userId]
        );

        if (result.rows.length === 0) {
            // If no score exists, calculate and create one
            const calculatedScore = await calculateCibilScore(userId);

            res.status(200).json({
                success: true,
                message: 'CIBIL score calculated',
                data: {
                    cibil: {
                        score: calculatedScore.score,
                        score_date: new Date(),
                        factors: calculatedScore.factors,
                    },
                },
            });
            return;
        }

        const cibilData = result.rows[0];

        res.status(200).json({
            success: true,
            message: 'CIBIL score retrieved successfully',
            data: {
                cibil: {
                    score: cibilData.score,
                    score_date: cibilData.score_date,
                    factors: cibilData.factors,
                },
            },
        });
    } catch (error) {
        logger.error('Get CIBIL score error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve CIBIL score',
        });
    }
};

/**
 * Calculate CIBIL score based on user's financial activity
 */
export const calculateCibilScore = async (userId: string) => {
    try {
        // Fetch user's accounts
        const accountsResult = await pool.query(
            'SELECT id, balance, created_at, status FROM accounts WHERE user_id = $1',
            [userId]
        );

        if (accountsResult.rows.length === 0) {
            return {
                score: 300, // Minimum score for new users
                factors: {
                    payment_history: 'no_data',
                    credit_utilization: 'no_data',
                    credit_age: 'no_data',
                    recent_inquiries: 'no_data',
                },
            };
        }

        const accounts = accountsResult.rows;
        let score = 300; // Base score

        // Factor 1: Payment History (35% weight) - Based on transaction patterns
        const transactionsResult = await pool.query(
            `SELECT type, status, amount, created_at 
             FROM transactions 
             WHERE account_id = ANY($1) 
             ORDER BY created_at DESC 
             LIMIT 50`,
            [accounts.map((acc: any) => acc.id)]
        );

        const transactions = transactionsResult.rows;
        const completedTransactions = transactions.filter((tx: any) => tx.status === 'completed').length;
        const totalTransactions = transactions.length;

        let paymentHistory = 'no_data';
        let paymentScore = 0;

        if (totalTransactions > 0) {
            const successRate = (completedTransactions / totalTransactions) * 100;

            if (successRate >= 95) {
                paymentHistory = 'excellent';
                paymentScore = 210; // 35% of 600
            } else if (successRate >= 85) {
                paymentHistory = 'good';
                paymentScore = 175;
            } else if (successRate >= 70) {
                paymentHistory = 'fair';
                paymentScore = 140;
            } else {
                paymentHistory = 'poor';
                paymentScore = 70;
            }
        }

        score += paymentScore;

        // Factor 2: Credit Utilization (30% weight) - Based on card usage
        const cardsResult = await pool.query(
            `SELECT spending_limit, current_spent, status 
             FROM virtual_cards 
             WHERE user_id = $1 AND status = 'active'`,
            [userId]
        );

        const cards = cardsResult.rows;
        let creditUtilization = 'no_data';
        let utilizationScore = 0;

        if (cards.length > 0) {
            const totalLimit = cards.reduce((sum: number, card: any) => sum + parseFloat(card.spending_limit), 0);
            const totalSpent = cards.reduce((sum: number, card: any) => sum + parseFloat(card.current_spent), 0);
            const utilizationRate = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;

            if (utilizationRate < 10) {
                creditUtilization = 'very_low';
                utilizationScore = 180; // 30% of 600
            } else if (utilizationRate < 30) {
                creditUtilization = 'low';
                utilizationScore = 150;
            } else if (utilizationRate < 50) {
                creditUtilization = 'medium';
                utilizationScore = 120;
            } else if (utilizationRate < 70) {
                creditUtilization = 'high';
                utilizationScore = 60;
            } else {
                creditUtilization = 'very_high';
                utilizationScore = 30;
            }
        }

        score += utilizationScore;

        // Factor 3: Credit Age (15% weight) - Based on account age
        const oldestAccount = accounts.reduce((oldest: any, acc: any) => {
            return new Date(acc.created_at) < new Date(oldest.created_at) ? acc : oldest;
        }, accounts[0]);

        const accountAgeMonths = Math.floor(
            (Date.now() - new Date(oldestAccount.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)
        );

        let creditAge = 'no_data';
        let ageScore = 0;

        if (accountAgeMonths >= 60) {
            creditAge = 'excellent';
            ageScore = 90; // 15% of 600
        } else if (accountAgeMonths >= 36) {
            creditAge = 'good';
            ageScore = 75;
        } else if (accountAgeMonths >= 12) {
            creditAge = 'fair';
            ageScore = 60;
        } else {
            creditAge = 'limited';
            ageScore = 30;
        }

        score += ageScore;

        // Factor 4: Recent Activity (20% weight) - Based on recent transactions
        const recentTransactions = transactions.filter((tx: any) => {
            const txDate = new Date(tx.created_at);
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            return txDate >= thirtyDaysAgo;
        });

        let recentInquiries = 'no_data';
        let activityScore = 0;

        if (recentTransactions.length === 0) {
            recentInquiries = 'none';
            activityScore = 120; // 20% of 600
        } else if (recentTransactions.length <= 5) {
            recentInquiries = 'minimal';
            activityScore = 100;
        } else if (recentTransactions.length <= 15) {
            recentInquiries = 'few';
            activityScore = 80;
        } else if (recentTransactions.length <= 30) {
            recentInquiries = 'moderate';
            activityScore = 60;
        } else {
            recentInquiries = 'several';
            activityScore = 40;
        }

        score += activityScore;

        // Ensure score is within valid range (300-900)
        score = Math.max(300, Math.min(900, score));

        return {
            score,
            factors: {
                payment_history: paymentHistory,
                credit_utilization: creditUtilization,
                credit_age: creditAge,
                recent_inquiries: recentInquiries,
            },
        };
    } catch (error) {
        logger.error('Calculate CIBIL score error:', error);
        throw error;
    }
};

/**
 * Update CIBIL score (called after significant transactions)
 */
export const updateCibilScore = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
            return;
        }

        // Calculate new score
        const calculatedScore = await calculateCibilScore(userId);

        // Insert new score record
        await pool.query(
            `INSERT INTO credit_scores (user_id, score, score_date, factors) 
             VALUES ($1, $2, CURRENT_DATE, $3)`,
            [userId, calculatedScore.score, JSON.stringify(calculatedScore.factors)]
        );

        res.status(200).json({
            success: true,
            message: 'CIBIL score updated successfully',
            data: {
                cibil: {
                    score: calculatedScore.score,
                    score_date: new Date(),
                    factors: calculatedScore.factors,
                },
            },
        });
    } catch (error) {
        logger.error('Update CIBIL score error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update CIBIL score',
        });
    }
};

/**
 * Get CIBIL score history
 */
export const getCibilHistory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
            return;
        }

        const result = await pool.query(
            `SELECT score, score_date, factors 
             FROM credit_scores 
             WHERE user_id = $1 
             ORDER BY score_date DESC 
             LIMIT 12`,
            [userId]
        );

        res.status(200).json({
            success: true,
            message: 'CIBIL score history retrieved successfully',
            data: {
                history: result.rows,
            },
        });
    } catch (error) {
        logger.error('Get CIBIL history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve CIBIL score history',
        });
    }
};
