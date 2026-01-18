import { body, param, query, ValidationChain } from 'express-validator';

/**
 * Email validation
 */
export const validateEmail = (): ValidationChain => {
    return body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address');
};

/**
 * Password validation
 */
export const validatePassword = (): ValidationChain => {
    return body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
};

/**
 * Phone number validation (Indian format)
 */
export const validatePhone = (): ValidationChain => {
    return body('phone')
        .matches(/^(\+91)?[6-9]\d{9}$/)
        .withMessage('Please provide a valid Indian phone number');
};

/**
 * PAN validation
 */
export const validatePAN = (): ValidationChain => {
    return body('pan_number')
        .optional()
        .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
        .withMessage('Please provide a valid PAN number');
};

/**
 * Aadhaar validation
 */
export const validateAadhaar = (): ValidationChain => {
    return body('aadhaar_number')
        .optional()
        .matches(/^\d{12}$/)
        .withMessage('Please provide a valid 12-digit Aadhaar number');
};

/**
 * Amount validation
 */
export const validateAmount = (field: string = 'amount'): ValidationChain => {
    return body(field)
        .isFloat({ min: 0.01 })
        .withMessage('Amount must be greater than 0')
        .custom((value) => {
            if (value > 10000000) {
                throw new Error('Amount exceeds maximum limit of ₹1,00,00,000');
            }
            return true;
        });
};

/**
 * UUID validation
 */
export const validateUUID = (field: string = 'id'): ValidationChain => {
    return param(field)
        .isUUID()
        .withMessage('Invalid ID format');
};

/**
 * OTP validation
 */
export const validateOTP = (): ValidationChain => {
    return body('otp')
        .isLength({ min: 6, max: 6 })
        .isNumeric()
        .withMessage('OTP must be a 6-digit number');
};

/**
 * Date validation
 */
export const validateDate = (field: string): ValidationChain => {
    return body(field)
        .isISO8601()
        .toDate()
        .withMessage('Please provide a valid date');
};

/**
 * Pagination validation
 */
export const validatePagination = (): ValidationChain[] => {
    return [
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Page must be a positive integer'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('Limit must be between 1 and 100'),
    ];
};

/**
 * Card type validation
 */
export const validateCardType = (): ValidationChain => {
    return body('card_type')
        .isIn(['basic', 'premium', 'elite'])
        .withMessage('Card type must be basic, premium, or elite');
};

/**
 * Transaction type validation
 */
export const validateTransactionType = (): ValidationChain => {
    return body('type')
        .isIn(['deposit', 'withdrawal', 'transfer', 'card_payment'])
        .withMessage('Invalid transaction type');
};

/**
 * Registration validation
 */
export const registerValidation = [
    validateEmail(),
    validatePassword(),
    body('full_name')
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('Full name must be between 2 and 255 characters'),
    validatePhone(),
    body('date_of_birth')
        .optional()
        .isISO8601()
        .toDate()
        .custom((value) => {
            const age = new Date().getFullYear() - new Date(value).getFullYear();
            if (age < 18) {
                throw new Error('You must be at least 18 years old');
            }
            return true;
        }),
    validatePAN(),
    validateAadhaar(),
];

/**
 * Login validation
 */
export const loginValidation = [
    validateEmail(),
    body('password').notEmpty().withMessage('Password is required'),
];

/**
 * Create account validation
 */
export const createAccountValidation = [
    body('account_type')
        .isIn(['savings', 'current'])
        .withMessage('Account type must be savings or current'),
];

/**
 * Create transaction validation
 */
export const createTransactionValidation = [
    validateTransactionType(),
    validateAmount(),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters'),
    body('recipient_account')
        .if(body('type').equals('transfer'))
        .notEmpty()
        .withMessage('Recipient account is required for transfers')
        .isLength({ min: 16, max: 16 })
        .withMessage('Invalid account number'),
];

/**
 * Apply for card validation
 */
export const applyForCardValidation = [
    validateCardType(),
    body('account_id')
        .isUUID()
        .withMessage('Invalid account ID'),
];

/**
 * Create deposit validation
 */
export const createDepositValidation = [
    body('account_id')
        .isUUID()
        .withMessage('Invalid account ID'),
    validateAmount('principal_amount'),
    body('tenure_months')
        .isInt({ min: 6, max: 120 })
        .withMessage('Tenure must be between 6 and 120 months'),
    body('auto_renew')
        .optional()
        .isBoolean()
        .withMessage('Auto renew must be a boolean'),
];
