import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import CardModel from '../models/Card';
import AccountModel from '../models/Account';
import logger from '../utils/logger';

class CardController {
    /**
     * Get all cards for current user
     */
    async getMyCards(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const cards = await CardModel.findByUserId(userId);

            res.status(200).json({
                success: true,
                data: { cards },
            });
        } catch (error: any) {
            logger.error('Get cards error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch cards',
            });
        }
    }

    /**
     * Create a new card
     */
    async createCard(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const { account_id, card_type, cardholder_name, spending_limit } = req.body;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
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

            // Map frontend card types to schema enum
            let mappedCardType: 'basic' | 'premium' | 'elite' = 'basic';
            if (card_type === 'credit' || card_type === 'premium') {
                mappedCardType = 'premium';
            } else if (card_type === 'elite') {
                mappedCardType = 'elite';
            }

            // Create card
            const card = await CardModel.create({
                account_id,
                user_id: userId,
                card_type: mappedCardType,
                card_holder_name: cardholder_name,
                spending_limit,
            });

            res.status(201).json({
                success: true,
                message: 'Card created successfully',
                data: { card },
            });
        } catch (error: any) {
            logger.error('Create card error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create card',
            });
        }
    }

    /**
     * Get card by ID
     */
    async getCardById(req: AuthRequest, res: Response): Promise<void> {
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

            const card = await CardModel.findById(id);

            if (!card) {
                res.status(404).json({
                    success: false,
                    message: 'Card not found',
                });
                return;
            }

            // Verify card belongs to user
            if (card.user_id !== userId) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied',
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: { card },
            });
        } catch (error: any) {
            logger.error('Get card error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch card',
            });
        }
    }

    /**
     * Freeze card
     */
    async freezeCard(req: AuthRequest, res: Response): Promise<void> {
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

            const card = await CardModel.findById(id);

            if (!card) {
                res.status(404).json({
                    success: false,
                    message: 'Card not found',
                });
                return;
            }

            if (card.user_id !== userId) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied',
                });
                return;
            }

            const updatedCard = await CardModel.updateStatus(id, 'frozen');

            res.status(200).json({
                success: true,
                message: 'Card frozen successfully',
                data: { card: updatedCard },
            });
        } catch (error: any) {
            logger.error('Freeze card error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to freeze card',
            });
        }
    }

    /**
     * Unfreeze card
     */
    async unfreezeCard(req: AuthRequest, res: Response): Promise<void> {
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

            const card = await CardModel.findById(id);

            if (!card) {
                res.status(404).json({
                    success: false,
                    message: 'Card not found',
                });
                return;
            }

            if (card.user_id !== userId) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied',
                });
                return;
            }

            const updatedCard = await CardModel.updateStatus(id, 'active');

            res.status(200).json({
                success: true,
                message: 'Card unfrozen successfully',
                data: { card: updatedCard },
            });
        } catch (error: any) {
            logger.error('Unfreeze card error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to unfreeze card',
            });
        }
    }

    /**
     * Update card limits
     */
    async updateLimits(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const { id } = req.params;
            const { spending_limit, daily_limit } = req.body;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const card = await CardModel.findById(id);

            if (!card) {
                res.status(404).json({
                    success: false,
                    message: 'Card not found',
                });
                return;
            }

            if (card.user_id !== userId) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied',
                });
                return;
            }

            const updatedCard = await CardModel.updateLimits(id, spending_limit, daily_limit);

            res.status(200).json({
                success: true,
                message: 'Card limits updated successfully',
                data: { card: updatedCard },
            });
        } catch (error: any) {
            logger.error('Update limits error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update card limits',
            });
        }
    }

    /**
     * Delete card
     */
    async deleteCard(req: AuthRequest, res: Response): Promise<void> {
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

            const card = await CardModel.findById(id);

            if (!card) {
                res.status(404).json({
                    success: false,
                    message: 'Card not found',
                });
                return;
            }

            if (card.user_id !== userId) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied',
                });
                return;
            }

            await CardModel.delete(id);

            res.status(200).json({
                success: true,
                message: 'Card deleted successfully',
            });
        } catch (error: any) {
            logger.error('Delete card error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete card',
            });
        }
    }
}

export default new CardController();
