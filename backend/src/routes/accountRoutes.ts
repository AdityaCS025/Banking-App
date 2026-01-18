import { Router } from 'express';
import accountController from '../controllers/accountController';
import { authenticate } from '../middlewares/auth';
import { body, param } from 'express-validator';
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
router.get('/all', accountController.getAllAccounts);

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
router.get('/verify/:accountNumber', accountController.verifyAccount);

/**
 * @route   GET /api/accounts/:id
 * @desc    Get account by ID
 * @access  Private
 */
router.get('/:id', accountController.getAccountById);

export default router;
