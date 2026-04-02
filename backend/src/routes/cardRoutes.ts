import { Router, Request, Response } from 'express';
import cardController from '../controllers/cardController';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { body, param } from 'express-validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/cards
 * @desc    Get all cards for current user
 * @access  Private
 */
router.get('/', (req: Request, res: Response) => cardController.getMyCards(req as any, res));

/**
 * @route   POST /api/cards
 * @desc    Create a new card
 * @access  Private
 */
router.post(
    '/',
    [
        body('account_id').isUUID().withMessage('Invalid account ID'),
        body('card_type').isIn(['debit', 'credit', 'basic', 'premium', 'elite']).withMessage('Invalid card type'),
        body('cardholder_name').trim().isLength({ min: 2, max: 100 }).withMessage('Cardholder name is required'),
        body('spending_limit').optional().isFloat({ min: 0.01 }).withMessage('Invalid spending limit'),
        body('daily_limit').optional().isFloat({ min: 0.01 }).withMessage('Invalid daily limit'),
    ],
    validate,
    (req: Request, res: Response) => cardController.createCard(req as any, res)
);

/**
 * @route   GET /api/cards/:id
 * @desc    Get card by ID
 * @access  Private
 */
router.get(
    '/:id',
    [param('id').isUUID().withMessage('Invalid card ID')],
    validate,
    (req: Request, res: Response) => cardController.getCardById(req as any, res)
);

/**
 * @route   PUT /api/cards/:id/freeze
 * @desc    Freeze card
 * @access  Private
 */
router.put(
    '/:id/freeze',
    [param('id').isUUID().withMessage('Invalid card ID')],
    validate,
    (req: Request, res: Response) => cardController.freezeCard(req as any, res)
);

/**
 * @route   PUT /api/cards/:id/unfreeze
 * @desc    Unfreeze card
 * @access  Private
 */
router.put(
    '/:id/unfreeze',
    [param('id').isUUID().withMessage('Invalid card ID')],
    validate,
    (req: Request, res: Response) => cardController.unfreezeCard(req as any, res)
);

/**
 * @route   PUT /api/cards/:id/limits
 * @desc    Update card spending limits
 * @access  Private
 */
router.put(
    '/:id/limits',
    [
        param('id').isUUID().withMessage('Invalid card ID'),
        body('spending_limit').isFloat({ min: 0.01 }).withMessage('Invalid spending limit'),
        body('daily_limit').optional().isFloat({ min: 0.01 }).withMessage('Invalid daily limit'),
    ],
    validate,
    (req: Request, res: Response) => cardController.updateLimits(req as any, res)
);

/**
 * @route   DELETE /api/cards/:id
 * @desc    Delete card
 * @access  Private
 */
router.delete(
    '/:id',
    [param('id').isUUID().withMessage('Invalid card ID')],
    validate,
    (req: Request, res: Response) => cardController.deleteCard(req as any, res)
);

export default router;

