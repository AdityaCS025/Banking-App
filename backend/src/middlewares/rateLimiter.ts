import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Login rate limiter - stricter
 */
export const loginLimiter = rateLimit({
    windowMs: parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.LOGIN_RATE_LIMIT_MAX_ATTEMPTS || '50'), // Increased for testing
    message: {
        success: false,
        message: 'Too many login attempts, please try again after 15 minutes.',
    },
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * OTP rate limiter - very strict
 */
export const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Increased from 3 to 10 for development
    message: {
        success: false,
        message: 'Too many OTP requests, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Refresh token rate limiter
 */
export const refreshTokenLimiter = rateLimit({
    windowMs: parseInt(process.env.REFRESH_RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.REFRESH_RATE_LIMIT_MAX_ATTEMPTS || '30'),
    message: {
        success: false,
        message: 'Too many refresh attempts, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Transaction rate limiter
 */
export const transactionLimiter = rateLimit({
    windowMs: 60000, // 1 minute
    max: 10,
    message: {
        success: false,
        message: 'Too many transactions, please slow down.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Chatbot rate limiter
 */
export const chatbotLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20,
    message: {
        success: false,
        message: 'Too many chatbot requests, please slow down.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export default apiLimiter;
