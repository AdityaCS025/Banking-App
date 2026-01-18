import { Router } from 'express';
import cardController from '../controllers/cardController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/cards
 * @desc    Get all cards for current user
 * @access  Private
 */
router.get('/', cardController.getMyCards);

/**
 * @route   POST /api/cards
 * @desc    Create a new card
 * @access  Private
 */
router.post('/', cardController.createCard);

/**
 * @route   GET /api/cards/:id
 * @desc    Get card by ID
 * @access  Private
 */
router.get('/:id', cardController.getCardById);

/**
 * @route   PUT /api/cards/:id/freeze
 * @desc    Freeze card
 * @access  Private
 */
router.put('/:id/freeze', cardController.freezeCard);

/**
 * @route   PUT /api/cards/:id/unfreeze
 * @desc    Unfreeze card
 * @access  Private
 */
router.put('/:id/unfreeze', cardController.unfreezeCard);

/**
 * @route   PUT /api/cards/:id/limits
 * @desc    Update card spending limits
 * @access  Private
 */
router.put('/:id/limits', cardController.updateLimits);

/**
 * @route   DELETE /api/cards/:id
 * @desc    Delete card
 * @access  Private
 */
router.delete('/:id', cardController.deleteCard);

export default router;
