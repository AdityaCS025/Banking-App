import { Router } from 'express';
import accountController from '../controllers/accountController';
import { authenticate } from '../middlewares/auth';
import { body, param, query } from 'express-validator';
import { validate } from '../middlewares/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/accounts
 * @desc    Get all accounts for current user
 * @access  Private
 */
router.get('/', accountController.getMyAccounts);

/**
 * @route   GET /api/accounts/all
 * @desc    Get all accounts (banker/admin only)
 * @access  Private (Banker/Admin)
 */
router.get(
    '/all',
    [
        query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    ],
    validate,
    accountController.getAllAccounts
);

/**
 * @route   POST /api/accounts
 * @desc    Create a new account
 * @access  Private
 */
router.post(
    '/',
    [
        body('account_type')
            .isIn(['savings', 'current'])
            .withMessage('Account type must be savings or current'),
    ],
    validate,
    accountController.createAccount
);

/**
 * @route   GET /api/accounts/verify/:accountNumber
 * @desc    Verify account by account number (for transfers)
 * @access  Private
 */
router.get(
    '/verify/:accountNumber',
    [
        param('accountNumber')
            .isLength({ min: 16, max: 16 })
            .withMessage('Account number must be 16 digits')
            .isNumeric()
            .withMessage('Account number must be numeric'),
    ],
    validate,
    accountController.verifyAccount
);

/**
 * @route   GET /api/accounts/:id
 * @desc    Get account by ID
 * @access  Private
 */
router.get(
    '/:id',
    [param('id').isUUID().withMessage('Invalid account ID')],
    validate,
    accountController.getAccountById
);

export default router;
