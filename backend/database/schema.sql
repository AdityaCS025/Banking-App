-- =====================================================
-- VaultBank - Production Database Schema
-- PostgreSQL 14+
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE user_role AS ENUM ('customer', 'admin', 'banker');
CREATE TYPE account_status AS ENUM ('pending', 'active', 'suspended', 'closed');
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'transfer', 'card_payment');
CREATE TYPE transaction_status AS ENUM ('pending', 'approved', 'rejected', 'completed');
CREATE TYPE card_status AS ENUM ('pending', 'active', 'frozen', 'expired', 'cancelled');
CREATE TYPE card_type AS ENUM ('basic', 'premium', 'elite');
CREATE TYPE deposit_status AS ENUM ('active', 'matured', 'withdrawn');
CREATE TYPE kyc_status AS ENUM ('pending', 'approved', 'rejected');

-- =====================================================
-- TABLES
-- =====================================================

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    date_of_birth DATE,
    pan_number VARCHAR(10) UNIQUE,
    aadhaar_number VARCHAR(12) UNIQUE,
    address TEXT,
    role user_role DEFAULT 'customer',
    kyc_status kyc_status DEFAULT 'pending',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Accounts Table
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_number VARCHAR(16) UNIQUE NOT NULL,
    account_type VARCHAR(50) DEFAULT 'savings',
    balance DECIMAL(15, 2) DEFAULT 0.00 CHECK (balance >= 0),
    currency VARCHAR(3) DEFAULT 'INR',
    status account_status DEFAULT 'pending',
    ifsc_code VARCHAR(11) DEFAULT 'VLTB0000001',
    branch VARCHAR(100) DEFAULT 'Mumbai Main',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions Table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    balance_before DECIMAL(15, 2) NOT NULL,
    balance_after DECIMAL(15, 2) NOT NULL,
    status transaction_status DEFAULT 'completed',
    description TEXT,
    reference_number VARCHAR(50) UNIQUE,
    recipient_account VARCHAR(16),
    recipient_name VARCHAR(255),
    metadata JSONB,
    requires_approval BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Virtual Cards Table
CREATE TABLE virtual_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    card_number VARCHAR(16) UNIQUE NOT NULL,
    card_holder_name VARCHAR(255) NOT NULL,
    cvv VARCHAR(3) NOT NULL,
    card_type card_type DEFAULT 'basic',
    status card_status DEFAULT 'pending',
    spending_limit DECIMAL(15, 2) NOT NULL,
    current_spent DECIMAL(15, 2) DEFAULT 0.00,
    expiry_date DATE NOT NULL,
    issued_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deposits Table
CREATE TABLE deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    principal_amount DECIMAL(15, 2) NOT NULL CHECK (principal_amount > 0),
    interest_rate DECIMAL(5, 2) NOT NULL CHECK (interest_rate >= 0),
    tenure_months INTEGER NOT NULL CHECK (tenure_months > 0),
    maturity_amount DECIMAL(15, 2) NOT NULL,
    maturity_date DATE NOT NULL,
    status deposit_status DEFAULT 'active',
    auto_renew BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    matured_at TIMESTAMP
);

-- OTP Records Table
CREATE TABLE otp_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    purpose VARCHAR(50) NOT NULL, -- 'registration', 'login', 'transaction', 'password_reset'
    is_verified BOOLEAN DEFAULT false,
    retry_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Credit Scores Table
CREATE TABLE credit_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 300 AND score <= 900),
    score_date DATE DEFAULT CURRENT_DATE,
    factors JSONB, -- Store factors affecting score
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'email', 'sms', 'push'
    subject VARCHAR(255),
    message TEXT NOT NULL,
    is_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Actions Table (Audit Trail)
CREATE TABLE admin_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES users(id),
    action_type VARCHAR(100) NOT NULL, -- 'kyc_approve', 'account_activate', 'transaction_approve'
    target_type VARCHAR(50) NOT NULL, -- 'user', 'account', 'transaction'
    target_id UUID NOT NULL,
    details JSONB,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- KYC Documents Table
CREATE TABLE kyc_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- 'pan', 'aadhaar', 'passport', 'driving_license'
    document_number VARCHAR(50) NOT NULL,
    document_url TEXT, -- S3 or cloud storage URL
    verification_status kyc_status DEFAULT 'pending',
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refresh Tokens Table (JWT)
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_kyc_status ON users(kyc_status);

-- Accounts
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_account_number ON accounts(account_number);
CREATE INDEX idx_accounts_status ON accounts(status);

-- Transactions
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_reference_number ON transactions(reference_number);
CREATE INDEX idx_transactions_type ON transactions(type);

-- Virtual Cards
CREATE INDEX idx_virtual_cards_user_id ON virtual_cards(user_id);
CREATE INDEX idx_virtual_cards_account_id ON virtual_cards(account_id);
CREATE INDEX idx_virtual_cards_card_number ON virtual_cards(card_number);
CREATE INDEX idx_virtual_cards_status ON virtual_cards(status);

-- Deposits
CREATE INDEX idx_deposits_user_id ON deposits(user_id);
CREATE INDEX idx_deposits_account_id ON deposits(account_id);
CREATE INDEX idx_deposits_status ON deposits(status);
CREATE INDEX idx_deposits_maturity_date ON deposits(maturity_date);

-- OTP Records
CREATE INDEX idx_otp_records_user_id ON otp_records(user_id);
CREATE INDEX idx_otp_records_email ON otp_records(email);
CREATE INDEX idx_otp_records_expires_at ON otp_records(expires_at);

-- Credit Scores
CREATE INDEX idx_credit_scores_user_id ON credit_scores(user_id);
CREATE INDEX idx_credit_scores_score_date ON credit_scores(score_date DESC);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_sent ON notifications(is_sent);

-- Admin Actions
CREATE INDEX idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX idx_admin_actions_created_at ON admin_actions(created_at DESC);

-- Refresh Tokens
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update timestamp triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_virtual_cards_updated_at BEFORE UPDATE ON virtual_cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate transaction reference number
CREATE OR REPLACE FUNCTION generate_transaction_reference()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.reference_number IS NULL THEN
        NEW.reference_number := 'TXN' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDDHH24MISS') || SUBSTRING(NEW.id::TEXT, 1, 6);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_transaction_reference BEFORE INSERT ON transactions
    FOR EACH ROW EXECUTE FUNCTION generate_transaction_reference();

-- Auto-delete expired OTPs
CREATE OR REPLACE FUNCTION delete_expired_otps()
RETURNS void AS $$
BEGIN
    DELETE FROM otp_records WHERE expires_at < CURRENT_TIMESTAMP AND is_verified = false;
END;
$$ language 'plpgsql';

-- =====================================================
-- VIEWS
-- =====================================================

-- User Account Summary View
CREATE OR REPLACE VIEW user_account_summary AS
SELECT 
    u.id AS user_id,
    u.full_name,
    u.email,
    u.kyc_status,
    COUNT(DISTINCT a.id) AS total_accounts,
    COALESCE(SUM(a.balance), 0) AS total_balance,
    COUNT(DISTINCT vc.id) AS total_cards,
    COUNT(DISTINCT d.id) AS total_deposits
FROM users u
LEFT JOIN accounts a ON u.id = a.user_id AND a.status = 'active'
LEFT JOIN virtual_cards vc ON u.id = vc.user_id AND vc.status = 'active'
LEFT JOIN deposits d ON u.id = d.user_id AND d.status = 'active'
GROUP BY u.id, u.full_name, u.email, u.kyc_status;

-- Recent Transactions View
CREATE OR REPLACE VIEW recent_transactions AS
SELECT 
    t.id,
    t.account_id,
    a.account_number,
    u.full_name AS account_holder,
    t.type,
    t.amount,
    t.status,
    t.description,
    t.reference_number,
    t.created_at
FROM transactions t
JOIN accounts a ON t.account_id = a.id
JOIN users u ON a.user_id = u.id
ORDER BY t.created_at DESC;

-- Pending Approvals View (for Admin)
CREATE OR REPLACE VIEW pending_approvals AS
SELECT 
    'transaction' AS approval_type,
    t.id,
    t.reference_number AS reference,
    t.amount,
    u.full_name AS requester,
    t.created_at
FROM transactions t
JOIN accounts a ON t.account_id = a.id
JOIN users u ON a.user_id = u.id
WHERE t.status = 'pending' AND t.requires_approval = true
UNION ALL
SELECT 
    'kyc' AS approval_type,
    u.id,
    u.email AS reference,
    NULL AS amount,
    u.full_name AS requester,
    u.created_at
FROM users u
WHERE u.kyc_status = 'pending'
UNION ALL
SELECT 
    'account' AS approval_type,
    a.id,
    a.account_number AS reference,
    NULL AS amount,
    u.full_name AS requester,
    a.created_at
FROM accounts a
JOIN users u ON a.user_id = u.id
WHERE a.status = 'pending'
ORDER BY created_at DESC;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Calculate compound interest for deposits
CREATE OR REPLACE FUNCTION calculate_maturity_amount(
    principal DECIMAL,
    rate DECIMAL,
    tenure_months INTEGER
)
RETURNS DECIMAL AS $$
DECLARE
    maturity_amount DECIMAL;
    n INTEGER := 4; -- Quarterly compounding
    t DECIMAL;
BEGIN
    t := tenure_months / 12.0;
    maturity_amount := principal * POWER(1 + (rate / (100 * n)), n * t);
    RETURN ROUND(maturity_amount, 2);
END;
$$ language 'plpgsql';

-- =====================================================
-- CONSTRAINTS & BUSINESS RULES
-- =====================================================

-- Ensure account balance never goes negative (additional check)
ALTER TABLE accounts ADD CONSTRAINT check_positive_balance CHECK (balance >= 0);

-- Ensure transaction amounts are positive
ALTER TABLE transactions ADD CONSTRAINT check_positive_amount CHECK (amount > 0);

-- Ensure card expiry is in the future
ALTER TABLE virtual_cards ADD CONSTRAINT check_future_expiry 
    CHECK (expiry_date > CURRENT_DATE OR status = 'expired');

-- Ensure OTP expires in the future when created
ALTER TABLE otp_records ADD CONSTRAINT check_future_expiry_otp 
    CHECK (expires_at > created_at);

-- =====================================================
-- INITIAL DATA / SEED
-- =====================================================

-- Create default admin user (password: Admin@123)
-- Password hash for 'Admin@123' using bcrypt
INSERT INTO users (email, password_hash, full_name, phone, role, kyc_status, email_verified, is_active)
VALUES (
    'admin@vaultbank.com',
    '$2a$10$XqZ8J7Z8J7Z8J7Z8J7Z8J.Z8J7Z8J7Z8J7Z8J7Z8J7Z8J7Z8J7Z8J', -- This is a placeholder, will be generated properly in seed.sql
    'System Administrator',
    '+919999999999',
    'admin',
    'approved',
    true,
    true
);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE users IS 'Stores user account information including customers, admins, and bankers';
COMMENT ON TABLE accounts IS 'Bank accounts linked to users';
COMMENT ON TABLE transactions IS 'All financial transactions with audit trail';
COMMENT ON TABLE virtual_cards IS 'Virtual debit/credit cards for online payments';
COMMENT ON TABLE deposits IS 'Fixed deposits with interest calculation';
COMMENT ON TABLE otp_records IS 'One-time passwords for verification';
COMMENT ON TABLE credit_scores IS 'CIBIL credit score history';
COMMENT ON TABLE notifications IS 'Email/SMS notification queue';
COMMENT ON TABLE admin_actions IS 'Audit trail for administrative actions';
COMMENT ON TABLE kyc_documents IS 'KYC document storage and verification';
COMMENT ON TABLE refresh_tokens IS 'JWT refresh tokens for authentication';

-- =====================================================
-- END OF SCHEMA
-- =====================================================
