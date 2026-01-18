import jwt from 'jsonwebtoken';
import { jwtConfig, otpConfig } from '../config/jwt';
import UserModel, { CreateUserData, User } from '../models/User';
import { query } from '../config/database';
import { generateOTP } from '../utils/helpers';
import logger from '../utils/logger';

class AuthService {
    /**
     * Register a new user
     */
    async register(userData: CreateUserData): Promise<{ user: User; accessToken: string; refreshToken: string }> {
        // Check if user already exists
        const existingUser = await UserModel.findByEmail(userData.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        const existingPhone = await UserModel.findByPhone(userData.phone);
        if (existingPhone) {
            throw new Error('User with this phone number already exists');
        }

        // Create user
        const user = await UserModel.create(userData);

        // Generate tokens
        const { accessToken, refreshToken } = this.generateTokens(user);

        // Store refresh token
        await this.storeRefreshToken(user.id, refreshToken);

        logger.info(`User registered: ${user.id}`);

        return { user, accessToken, refreshToken };
    }

    /**
     * Login user
     */
    async login(email: string, password: string): Promise<{ user: User; accessToken: string; refreshToken: string }> {
        // Verify credentials
        const user = await UserModel.verifyPassword(email, password);

        if (!user) {
            throw new Error('Invalid email or password');
        }

        if (!user.is_active) {
            throw new Error('Your account has been deactivated. Please contact support.');
        }

        // Generate tokens
        const { accessToken, refreshToken } = this.generateTokens(user);

        // Store refresh token
        await this.storeRefreshToken(user.id, refreshToken);

        logger.info(`User logged in: ${user.id}`);

        return { user, accessToken, refreshToken };
    }

    /**
     * Refresh access token
     */
    async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
        try {
            // Verify refresh token
            const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret) as {
                id: string;
                email: string;
                role: string;
            };

            // Check if refresh token exists and is not revoked
            const tokenResult = await query(
                `SELECT * FROM refresh_tokens
         WHERE token = $1 AND user_id = $2 AND is_revoked = false AND expires_at > CURRENT_TIMESTAMP`,
                [refreshToken, decoded.id]
            );

            if (!tokenResult.rows[0]) {
                throw new Error('Invalid or expired refresh token');
            }

            // Get user
            const user = await UserModel.findById(decoded.id);
            if (!user) {
                throw new Error('User not found');
            }

            // Generate new tokens
            const tokens = this.generateTokens(user);

            // Revoke old refresh token
            await query(
                `UPDATE refresh_tokens SET is_revoked = true WHERE token = $1`,
                [refreshToken]
            );

            // Store new refresh token
            await this.storeRefreshToken(user.id, tokens.refreshToken);

            logger.info(`Token refreshed for user: ${user.id}`);

            return tokens;
        } catch (error) {
            logger.error('Token refresh failed:', error);
            throw new Error('Invalid or expired refresh token');
        }
    }

    /**
     * Logout user
     */
    async logout(refreshToken: string): Promise<void> {
        await query(
            `UPDATE refresh_tokens SET is_revoked = true WHERE token = $1`,
            [refreshToken]
        );

        logger.info('User logged out');
    }

    /**
     * Generate OTP
     */
    async generateOTP(email: string, purpose: string): Promise<string> {
        const otp = generateOTP();
        const expiryMinutes = otpConfig.expiryMinutes;

        // Check existing OTP attempts
        const existingOTPs = await query(
            `SELECT COUNT(*) FROM otp_records
       WHERE email = $1 AND purpose = $2 AND created_at > CURRENT_TIMESTAMP - INTERVAL '10 minutes'`,
            [email, purpose]
        );

        const attemptCount = parseInt(existingOTPs.rows[0].count);

        if (attemptCount >= otpConfig.maxRetries) {
            throw new Error('Too many OTP requests. Please try again after 10 minutes.');
        }

        // Store OTP
        await query(
            `INSERT INTO otp_records (email, otp_code, purpose, expires_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP + INTERVAL '${expiryMinutes} minutes')`,
            [email, otp, purpose]
        );

        // Send OTP via email
        const emailService = (await import('./emailService')).default;
        const emailSent = await emailService.sendOTP(email, otp, purpose);

        if (!emailSent) {
            logger.warn(`Failed to send OTP email to ${email}, but OTP was generated`);
        }

        logger.info(`OTP generated for ${email} (purpose: ${purpose})`);

        return otp;
    }

    /**
     * Verify OTP
     */
    async verifyOTP(email: string, otp: string, purpose: string): Promise<boolean> {
        const result = await query(
            `SELECT * FROM otp_records
       WHERE email = $1 AND otp_code = $2 AND purpose = $3
       AND is_verified = false AND expires_at > CURRENT_TIMESTAMP
       ORDER BY created_at DESC
       LIMIT 1`,
            [email, otp, purpose]
        );

        if (!result.rows[0]) {
            // Increment retry count
            await query(
                `UPDATE otp_records
         SET retry_count = retry_count + 1
         WHERE email = $1 AND purpose = $2 AND is_verified = false`,
                [email, purpose]
            );

            return false;
        }

        // Mark OTP as verified
        await query(
            `UPDATE otp_records SET is_verified = true WHERE id = $1`,
            [result.rows[0].id]
        );

        logger.info(`OTP verified for ${email} (purpose: ${purpose})`);

        return true;
    }

    /**
     * Generate JWT tokens
     */
    private generateTokens(user: User): { accessToken: string; refreshToken: string } {
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
        };

        const accessToken = jwt.sign(payload, jwtConfig.accessSecret, {
            expiresIn: jwtConfig.accessExpiry,
        } as jwt.SignOptions);

        const refreshToken = jwt.sign(payload, jwtConfig.refreshSecret, {
            expiresIn: jwtConfig.refreshExpiry,
        } as jwt.SignOptions);

        return { accessToken, refreshToken };
    }

    /**
     * Store refresh token in database
     */
    private async storeRefreshToken(userId: string, token: string): Promise<void> {
        const expiryDays = 7; // Match with JWT_REFRESH_EXPIRY

        await query(
            `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '${expiryDays} days')`,
            [userId, token]
        );
    }
}

export default new AuthService();
