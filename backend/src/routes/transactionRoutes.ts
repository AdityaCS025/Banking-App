import { Router } from 'express';
import transactionController from '../controllers/transactionController';
import { authenticate } from '../middlewares/auth';
import { query as queryValidator, body, param } from 'express-validator';
import { validate } from '../middlewares/validation';
import { transactionLimiter } from '../middlewares/rateLimiter';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/transactions
 * @desc    Get transactions for user's accounts
 * @access  Private
 */
router.get(
    '/',
    [
        queryValidator('account_id').optional().isUUID(),
        queryValidator('page').optional().isInt({ min: 1 }),
        queryValidator('limit').optional().isInt({ min: 1, max: 100 }),
    ],
    validate,
    transactionController.getMyTransactions
);

/**
 * @route   GET /api/transactions/stats
 * @desc    Get transaction statistics (income/expenses)
 * @access  Private
 */
router.get('/stats', transactionController.getStats);

/**
 * @route   GET /api/transactions/:id
 * @desc    Get transaction by ID
 * @access  Private
 */
router.get(
    '/:id',
    [param('id').isUUID().withMessage('Invalid transaction ID')],
    validate,
    transactionController.getTransactionById
);

/**
 * @route   POST /api/transactions/deposit
 * @desc    Deposit money into account
 * @access  Private
 */
router.post(
    '/deposit',
    transactionLimiter,
    [
        body('account_id').isUUID().withMessage('Invalid account ID'),
        body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
        body('description').optional().isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
    ],
    validate,
    transactionController.deposit
);

/**
 * @route   POST /api/transactions/withdraw
 * @desc    Withdraw money from account
 * @access  Private
 */
router.post(
    '/withdraw',
    transactionLimiter,
    [
        body('account_id').isUUID().withMessage('Invalid account ID'),
        body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
        body('description').optional().isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
    ],
    validate,
    transactionController.withdraw
);

/**
 * @route   POST /api/transactions/transfer
 * @desc    Transfer money between accounts
 * @access  Private
 */
router.post(
    '/transfer',
    transactionLimiter,
    [
        body('from_account_id').isUUID().withMessage('Invalid source account ID'),
        body('to_account_id').isUUID().withMessage('Invalid destination account ID'),
        body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
        body('description').optional().isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
    ],
    validate,
    transactionController.transfer
);

export default router;
