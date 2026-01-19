import { query } from '../config/database';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger';

export interface User {
    id: string;
    email: string;
    password_hash?: string;
    full_name: string;
    phone: string;
    date_of_birth?: Date;
    pan_number?: string;
    aadhaar_number?: string;
    address?: string;
    role: 'customer' | 'admin' | 'banker';
    kyc_status: 'pending' | 'approved' | 'rejected';
    is_active: boolean;
    email_verified: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface CreateUserData {
    email: string;
    password: string;
    full_name: string;
    phone: string;
    date_of_birth?: Date;
    pan_number?: string;
    aadhaar_number?: string;
    address?: string;
    role?: 'customer' | 'admin' | 'banker';
}

class UserModel {
    /**
     * Create a new user
     */
    async create(userData: CreateUserData): Promise<User> {
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
        const passwordHash = await bcrypt.hash(userData.password, saltRounds);

        const result = await query(
            `INSERT INTO users (
        email, password_hash, full_name, phone, date_of_birth,
        pan_number, aadhaar_number, address, role
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, email, full_name, phone, date_of_birth, pan_number,
                aadhaar_number, address, role, kyc_status, is_active,
                email_verified, created_at, updated_at`,
            [
                userData.email,
                passwordHash,
                userData.full_name,
                userData.phone,
                userData.date_of_birth || null,
                userData.pan_number || null,
                userData.aadhaar_number || null,
                userData.address || null,
                userData.role || 'customer',
            ]
        );

        logger.info(`User created: ${result.rows[0].id}`);
        return result.rows[0];
    }

    /**
     * Find user by ID
     */
    async findById(id: string): Promise<User | null> {
        const result = await query(
            `SELECT id, email, full_name, phone, date_of_birth, pan_number,
              aadhaar_number, address, role, kyc_status, is_active,
              email_verified, created_at, updated_at
       FROM users WHERE id = $1`,
            [id]
        );

        return result.rows[0] || null;
    }

    /**
     * Find user by email (includes password hash for authentication)
     */
    async findByEmail(email: string, includePassword: boolean = false): Promise<User | null> {
        const fields = includePassword
            ? `id, email, password_hash, full_name, phone, date_of_birth, pan_number,
         aadhaar_number, address, role, kyc_status, is_active, email_verified,
         created_at, updated_at`
            : `id, email, full_name, phone, date_of_birth, pan_number,
         aadhaar_number, address, role, kyc_status, is_active, email_verified,
         created_at, updated_at`;

        const result = await query(`SELECT ${fields} FROM users WHERE email = $1`, [email]);

        return result.rows[0] || null;
    }

    /**
     * Find user by phone
     */
    async findByPhone(phone: string): Promise<User | null> {
        const result = await query(
            `SELECT id, email, full_name, phone, date_of_birth, pan_number,
              aadhaar_number, address, role, kyc_status, is_active,
              email_verified, created_at, updated_at
       FROM users WHERE phone = $1`,
            [phone]
        );

        return result.rows[0] || null;
    }

    /**
     * Update user profile
     */
    async updateProfile(
        id: string,
        updates: Partial<Omit<User, 'id' | 'email' | 'password_hash' | 'role' | 'created_at'>>
    ): Promise<User | null> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        Object.entries(updates).forEach(([key, value]) => {
            if (value !== undefined) {
                fields.push(`${key} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        });

        if (fields.length === 0) {
            return this.findById(id);
        }

        values.push(id);

        const result = await query(
            `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING id, email, full_name, phone, date_of_birth, pan_number,
                 aadhaar_number, address, role, kyc_status, is_active,
                 email_verified, created_at, updated_at`,
            values
        );

        logger.info(`User profile updated: ${id}`);
        return result.rows[0] || null;
    }

    /**
     * Update password
     */
    async updatePassword(id: string, newPassword: string): Promise<boolean> {
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
        const passwordHash = await bcrypt.hash(newPassword, saltRounds);

        const result = await query(
            `UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
            [passwordHash, id]
        );

        logger.info(`Password updated for user: ${id}`);
        return result.rowCount! > 0;
    }

    /**
     * Verify password
     */
    async verifyPassword(email: string, password: string): Promise<User | null> {
        logger.info(`verifyPassword called for email: ${email}`);
        
        const user = await this.findByEmail(email, true);
        
        logger.info(`User found: ${user ? 'yes' : 'no'}, has password_hash: ${user?.password_hash ? 'yes' : 'no'}`);

        if (!user || !user.password_hash) {
            logger.warn(`Login failed: user not found or no password hash for ${email}`);
            return null;
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        logger.info(`Password comparison result for ${email}: ${isValid}`);

        if (!isValid) {
            return null;
        }

        // Remove password hash before returning
        delete user.password_hash;
        return user;
    }

    /**
     * Update KYC status
     */
    async updateKYCStatus(
        id: string,
        status: 'pending' | 'approved' | 'rejected'
    ): Promise<User | null> {
        const result = await query(
            `UPDATE users SET kyc_status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, email, full_name, phone, date_of_birth, pan_number,
                 aadhaar_number, address, role, kyc_status, is_active,
                 email_verified, created_at, updated_at`,
            [status, id]
        );

        logger.info(`KYC status updated for user ${id}: ${status}`);
        return result.rows[0] || null;
    }

    /**
     * Verify email
     */
    async verifyEmail(id: string): Promise<boolean> {
        const result = await query(
            `UPDATE users SET email_verified = true, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
            [id]
        );

        logger.info(`Email verified for user: ${id}`);
        return result.rowCount! > 0;
    }

    /**
     * Get all users (admin only)
     */
    async findAll(page: number = 1, limit: number = 10): Promise<{ users: User[]; total: number }> {
        const offset = (page - 1) * limit;

        const [usersResult, countResult] = await Promise.all([
            query(
                `SELECT id, email, full_name, phone, date_of_birth, pan_number,
                aadhaar_number, address, role, kyc_status, is_active,
                email_verified, created_at, updated_at
         FROM users
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
                [limit, offset]
            ),
            query(`SELECT COUNT(*) FROM users`),
        ]);

        return {
            users: usersResult.rows,
            total: parseInt(countResult.rows[0].count),
        };
    }

    /**
     * Deactivate user
     */
    async deactivate(id: string): Promise<boolean> {
        const result = await query(
            `UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
            [id]
        );

        logger.info(`User deactivated: ${id}`);
        return result.rowCount! > 0;
    }

    /**
     * Activate user
     */
    async activate(id: string): Promise<boolean> {
        const result = await query(
            `UPDATE users SET is_active = true, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
            [id]
        );

        logger.info(`User activated: ${id}`);
        return result.rowCount! > 0;
    }
}

export default new UserModel();
