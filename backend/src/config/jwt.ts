import dotenv from 'dotenv';

dotenv.config();

const requireEnv = (key: string): string => {
    const value = process.env[key];
    if (!value || value.trim().length === 0) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
};

export const jwtConfig = {
    accessSecret: requireEnv('JWT_ACCESS_SECRET'),
    refreshSecret: requireEnv('JWT_REFRESH_SECRET'),
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
};

export const otpConfig = {
    expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || '5'),
    maxRetries: parseInt(process.env.OTP_MAX_RETRIES || '3'),
};

export default jwtConfig;
