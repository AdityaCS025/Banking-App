import { Router } from 'express';
import authController from '../controllers/authController';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { loginLimiter, otpLimiter } from '../middlewares/rateLimiter';
import { registerValidation, loginValidation } from '../utils/validators';
import { body } from 'express-validator';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
    '/register',
    registerValidation,
    validate,
    authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
    '/login',
    loginLimiter,
    loginValidation,
    validate,
    authController.login
);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
    '/refresh-token',
    [body('refreshToken').notEmpty().withMessage('Refresh token is required')],
    validate,
    authController.refreshToken
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Public
 */
router.post(
    '/logout',
    [body('refreshToken').notEmpty().withMessage('Refresh token is required')],
    validate,
    authController.logout
);

/**
 * @route   POST /api/auth/send-otp
 * @desc    Send OTP to email
 * @access  Public
 */
router.post(
    '/send-otp',
    otpLimiter,
    [
        body('email').isEmail().withMessage('Valid email is required'),
        body('purpose').optional().isString(),
    ],
    validate,
    authController.sendOTP
);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP
 * @access  Public
 */
router.post(
    '/verify-otp',
    [
        body('email').isEmail().withMessage('Valid email is required'),
        body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
        body('purpose').optional().isString(),
    ],
    validate,
    authController.verifyOTP
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, authController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticate, authController.updateProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', authenticate, authController.changePassword);

/**
 * @route   GET /api/auth/users
 * @desc    Get all users (banker/admin only)
 * @access  Private (banker/admin)
 */
router.get('/users', authenticate, authController.getAllUsers);

/**
 * @route   PUT /api/auth/users/:userId/kyc
 * @desc    Update user KYC status (banker/admin only)
 * @access  Private (banker/admin)
 */
router.put('/users/:userId/kyc', authenticate, authController.updateUserKyc);

export default router;
