import { Router } from 'express';
import depositController from '../controllers/depositController';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { body, param } from 'express-validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/deposits
 * @desc    Get all deposits for current user
 * @access  Private
 */
router.get('/', depositController.getMyDeposits);

/**
 * @route   POST /api/deposits
 * @desc    Create a new deposit (FD/RD)
 * @access  Private
 */
router.post(
    '/',
    [
        body('account_id').isUUID().withMessage('Invalid account ID'),
        body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
        body('tenure_months').isInt({ min: 6, max: 120 }).withMessage('Tenure must be between 6 and 120 months'),
        body('auto_renew').optional().isBoolean().withMessage('Auto renew must be a boolean'),
    ],
    validate,
    depositController.createDeposit
);

/**
 * @route   GET /api/deposits/:id
 * @desc    Get deposit by ID
 * @access  Private
 */
router.get(
    '/:id',
    [param('id').isUUID().withMessage('Invalid deposit ID')],
    validate,
    depositController.getDepositById
);

/**
 * @route   POST /api/deposits/:id/break
 * @desc    Break deposit early
 * @access  Private
 */
router.post(
    '/:id/break',
    [param('id').isUUID().withMessage('Invalid deposit ID')],
    validate,
    depositController.breakDeposit
);

export default router;
