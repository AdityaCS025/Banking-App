-- =====================================================
-- VaultBank - Seed Data for Development & Testing
-- Run this after schema.sql
-- =====================================================

-- Clear existing data (for development only)
TRUNCATE TABLE 
    refresh_tokens,
    kyc_documents,
    admin_actions,
    notifications,
    credit_scores,
    otp_records,
    deposits,
    virtual_cards,
    transactions,
    accounts,
    users
CASCADE;

-- =====================================================
-- USERS
-- =====================================================

-- Password for all test users: Test@123
-- Hash generated using bcrypt with salt rounds = 10
INSERT INTO users (id, email, password_hash, full_name, phone, date_of_birth, pan_number, aadhaar_number, address, role, kyc_status, email_verified, is_active) VALUES
-- Admin User
('11111111-1111-1111-1111-111111111111', 'admin@vaultbank.com', '$2a$10$h92M5DjA2MKmHdM/7.tnyeJQWV97MadtOnXn/GSYZcmm6H13moEwu', 'System Administrator', '+919999999999', '1985-01-15', 'ADMIN12345', '999999999999', 'VaultBank HQ, Mumbai', 'admin', 'approved', true, true),

-- Banker User
('22222222-2222-2222-2222-222222222222', 'banker@vaultbank.com', '$2a$10$h92M5DjA2MKmHdM/7.tnyeJQWV97MadtOnXn/GSYZcmm6H13moEwu', 'Rajesh Kumar', '+919888888888', '1990-05-20', 'BNKR123456', '888888888888', 'Mumbai Branch, Mumbai', 'banker', 'approved', true, true),

-- Customer Users
('33333333-3333-3333-3333-333333333333', 'john.doe@gmail.com', '$2a$10$h92M5DjA2MKmHdM/7.tnyeJQWV97MadtOnXn/GSYZcmm6H13moEwu', 'John Doe', '+919876543210', '1995-03-10', 'ABCDE1234F', '123456789012', '123, MG Road, Mumbai, Maharashtra - 400001', 'customer', 'approved', true, true),

('44444444-4444-4444-4444-444444444444', 'priya.sharma@gmail.com', '$2a$10$h92M5DjA2MKmHdM/7.tnyeJQWV97MadtOnXn/GSYZcmm6H13moEwu', 'Priya Sharma', '+919765432109', '1998-07-25', 'FGHIJ5678K', '234567890123', '456, Park Street, Delhi, Delhi - 110001', 'customer', 'approved', true, true),

('55555555-5555-5555-5555-555555555555', 'amit.patel@yahoo.com', '$2a$10$h92M5DjA2MKmHdM/7.tnyeJQWV97MadtOnXn/GSYZcmm6H13moEwu', 'Amit Patel', '+919654321098', '1992-11-30', 'KLMNO9012P', '345678901234', '789, Brigade Road, Bangalore, Karnataka - 560001', 'customer', 'approved', true, true),

-- Pending KYC Customer
('66666666-6666-6666-6666-666666666666', 'neha.gupta@outlook.com', '$2a$10$h92M5DjA2MKmHdM/7.tnyeJQWV97MadtOnXn/GSYZcmm6H13moEwu', 'Neha Gupta', '+919543210987', '2000-02-14', 'PQRST3456U', '456789012345', '321, Anna Salai, Chennai, Tamil Nadu - 600001', 'customer', 'pending', true, true);

-- =====================================================
-- ACCOUNTS
-- =====================================================

INSERT INTO accounts (id, user_id, account_number, account_type, balance, status) VALUES
-- John Doe's Accounts
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', '1234567890123456', 'savings', 2068500.00, 'active'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', '33333333-3333-3333-3333-333333333333', '1234567890123457', 'current', 500000.00, 'active'),

-- Priya Sharma's Account
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444', '2345678901234567', 'savings', 1250000.00, 'active'),

-- Amit Patel's Account
('cccccccc-cccc-cccc-cccc-cccccccccccc', '55555555-5555-5555-5555-555555555555', '3456789012345678', 'savings', 875000.00, 'active'),

-- Neha Gupta's Account (Pending)
('dddddddd-dddd-dddd-dddd-dddddddddddd', '66666666-6666-6666-6666-666666666666', '4567890123456789', 'savings', 0.00, 'pending');

-- =====================================================
-- TRANSACTIONS
-- =====================================================

INSERT INTO transactions (account_id, type, amount, balance_before, balance_after, status, description, recipient_account, recipient_name, created_at) VALUES
-- John Doe's Transactions
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'deposit', 375000.00, 1693500.00, 2068500.00, 'completed', 'Salary Deposit', NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '1 day'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'withdrawal', 1299.00, 2069799.00, 2068500.00, 'completed', 'Netflix Subscription', NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'card_payment', 7450.00, 2075950.00, 2068500.00, 'completed', 'Amazon Purchase', NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '2 days'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'deposit', 70850.00, 2005100.00, 2075950.00, 'completed', 'Freelance Payment', NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '3 days'),

-- Priya Sharma's Transactions
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'deposit', 500000.00, 750000.00, 1250000.00, 'completed', 'Salary Credit', NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '5 days'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'transfer', 25000.00, 775000.00, 750000.00, 'completed', 'Transfer to Amit Patel', '3456789012345678', 'Amit Patel', CURRENT_TIMESTAMP - INTERVAL '7 days'),

-- Amit Patel's Transactions
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'deposit', 25000.00, 850000.00, 875000.00, 'completed', 'Transfer from Priya Sharma', '2345678901234567', 'Priya Sharma', CURRENT_TIMESTAMP - INTERVAL '7 days'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'withdrawal', 15000.00, 865000.00, 850000.00, 'completed', 'ATM Withdrawal', NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '10 days'),

-- Pending Transaction (requires approval)
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'transfer', 500000.00, 2068500.00, 1568500.00, 'pending', 'Large Transfer - Requires Approval', '2345678901234567', 'Priya Sharma', CURRENT_TIMESTAMP - INTERVAL '1 hour');

UPDATE transactions SET requires_approval = true WHERE amount > 100000 AND status = 'pending';

-- =====================================================
-- VIRTUAL CARDS
-- =====================================================

INSERT INTO virtual_cards (id, user_id, account_id, card_number, card_holder_name, cvv, card_type, status, spending_limit, current_spent, expiry_date, issued_at) VALUES
-- John Doe's Cards
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '4242424242424242', 'JOHN DOE', '123', 'premium', 'active', 2000000.00, 8749.00, '2028-12-31', CURRENT_TIMESTAMP - INTERVAL '30 days'),

-- Priya Sharma's Card
('ffffffff-ffff-ffff-ffff-ffffffffffff', '44444444-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '5555555555554444', 'PRIYA SHARMA', '456', 'basic', 'active', 400000.00, 12500.00, '2027-06-30', CURRENT_TIMESTAMP - INTERVAL '60 days'),

-- Amit Patel's Card (Frozen)
('gggggggg-gggg-gggg-gggg-gggggggggggg', '55555555-5555-5555-5555-555555555555', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '3782822463100005', 'AMIT PATEL', '789', 'elite', 'frozen', 5000000.00, 0.00, '2029-03-31', CURRENT_TIMESTAMP - INTERVAL '15 days'),

-- Neha Gupta's Card (Pending)
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', '66666666-6666-6666-6666-666666666666', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '6011111111111117', 'NEHA GUPTA', '321', 'basic', 'pending', 400000.00, 0.00, '2027-12-31', NULL);

-- =====================================================
-- DEPOSITS
-- =====================================================

INSERT INTO deposits (id, user_id, account_id, principal_amount, interest_rate, tenure_months, maturity_amount, maturity_date, status) VALUES
-- John Doe's Deposits
('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 500000.00, 7.5, 12, 538281.25, CURRENT_DATE + INTERVAL '12 months', 'active'),
('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1000000.00, 8.0, 24, 1169858.81, CURRENT_DATE + INTERVAL '24 months', 'active'),

-- Priya Sharma's Deposit
('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', '44444444-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 300000.00, 7.0, 6, 310622.66, CURRENT_DATE + INTERVAL '6 months', 'active');

-- Update maturity amounts using the function
UPDATE deposits SET maturity_amount = calculate_maturity_amount(principal_amount, interest_rate, tenure_months);

-- =====================================================
-- CREDIT SCORES
-- =====================================================

INSERT INTO credit_scores (user_id, score, score_date, factors) VALUES
('33333333-3333-3333-3333-333333333333', 780, CURRENT_DATE, '{"payment_history": "excellent", "credit_utilization": "low", "credit_age": "good", "recent_inquiries": "minimal"}'),
('44444444-4444-4444-4444-444444444444', 745, CURRENT_DATE, '{"payment_history": "good", "credit_utilization": "medium", "credit_age": "fair", "recent_inquiries": "few"}'),
('55555555-5555-5555-5555-555555555555', 820, CURRENT_DATE, '{"payment_history": "excellent", "credit_utilization": "very_low", "credit_age": "excellent", "recent_inquiries": "none"}'),
('66666666-6666-6666-6666-666666666666', 650, CURRENT_DATE, '{"payment_history": "fair", "credit_utilization": "high", "credit_age": "limited", "recent_inquiries": "several"}');

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

INSERT INTO notifications (user_id, type, subject, message, is_sent, sent_at) VALUES
('33333333-3333-3333-3333-333333333333', 'email', 'Welcome to VaultBank', 'Welcome to VaultBank! Your account has been created successfully.', true, CURRENT_TIMESTAMP - INTERVAL '90 days'),
('33333333-3333-3333-3333-333333333333', 'email', 'Transaction Alert', 'Your account has been credited with ₹375,000.00', true, CURRENT_TIMESTAMP - INTERVAL '1 day'),
('33333333-3333-3333-3333-333333333333', 'email', 'Transaction Alert', 'Your account has been debited with ₹1,299.00 for Netflix Subscription', true, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('44444444-4444-4444-4444-444444444444', 'email', 'Welcome to VaultBank', 'Welcome to VaultBank! Your account has been created successfully.', true, CURRENT_TIMESTAMP - INTERVAL '60 days'),
('66666666-6666-6666-6666-666666666666', 'email', 'KYC Pending', 'Your KYC verification is pending. Please submit required documents.', false, NULL);

-- =====================================================
-- KYC DOCUMENTS
-- =====================================================

INSERT INTO kyc_documents (user_id, document_type, document_number, verification_status, verified_by, verified_at) VALUES
('33333333-3333-3333-3333-333333333333', 'pan', 'ABCDE1234F', 'approved', '11111111-1111-1111-1111-111111111111', CURRENT_TIMESTAMP - INTERVAL '85 days'),
('33333333-3333-3333-3333-333333333333', 'aadhaar', '123456789012', 'approved', '11111111-1111-1111-1111-111111111111', CURRENT_TIMESTAMP - INTERVAL '85 days'),
('44444444-4444-4444-4444-444444444444', 'pan', 'FGHIJ5678K', 'approved', '22222222-2222-2222-2222-222222222222', CURRENT_TIMESTAMP - INTERVAL '55 days'),
('44444444-4444-4444-4444-444444444444', 'aadhaar', '234567890123', 'approved', '22222222-2222-2222-2222-222222222222', CURRENT_TIMESTAMP - INTERVAL '55 days'),
('66666666-6666-6666-6666-666666666666', 'pan', 'PQRST3456U', 'pending', NULL, NULL);

-- =====================================================
-- ADMIN ACTIONS
-- =====================================================

INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, details) VALUES
('11111111-1111-1111-1111-111111111111', 'kyc_approve', 'user', '33333333-3333-3333-3333-333333333333', '{"approved_documents": ["pan", "aadhaar"]}'),
('11111111-1111-1111-1111-111111111111', 'account_activate', 'account', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"reason": "KYC approved"}'),
('22222222-2222-2222-2222-222222222222', 'kyc_approve', 'user', '44444444-4444-4444-4444-444444444444', '{"approved_documents": ["pan", "aadhaar"]}'),
('22222222-2222-2222-2222-222222222222', 'account_activate', 'account', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '{"reason": "KYC approved"}');

-- =====================================================
-- SUMMARY
-- =====================================================

-- Display summary
SELECT 'Database seeded successfully!' AS status;

SELECT 
    'Users' AS table_name,
    COUNT(*) AS record_count
FROM users
UNION ALL
SELECT 'Accounts', COUNT(*) FROM accounts
UNION ALL
SELECT 'Transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'Virtual Cards', COUNT(*) FROM virtual_cards
UNION ALL
SELECT 'Deposits', COUNT(*) FROM deposits
UNION ALL
SELECT 'Credit Scores', COUNT(*) FROM credit_scores
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'KYC Documents', COUNT(*) FROM kyc_documents
UNION ALL
SELECT 'Admin Actions', COUNT(*) FROM admin_actions;

-- =====================================================
-- TEST CREDENTIALS
-- =====================================================

/*
TEST USERS:
-----------
Admin:
  Email: admin@vaultbank.com
  Password: Test@123
  
Banker:
  Email: banker@vaultbank.com
  Password: Test@123

Customers:
  Email: john.doe@gmail.com
  Password: Test@123
  
  Email: priya.sharma@gmail.com
  Password: Test@123
  
  Email: amit.patel@yahoo.com
  Password: Test@123
  
  Email: neha.gupta@outlook.com (Pending KYC)
  Password: Test@123
*/
