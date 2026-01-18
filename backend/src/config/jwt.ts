import dotenv from 'dotenv';

dotenv.config();

export const jwtConfig = {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'your-access-secret-change-this',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-this',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
};

export const otpConfig = {
    expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || '5'),
    maxRetries: parseInt(process.env.OTP_MAX_RETRIES || '3'),
};

export default jwtConfig;
