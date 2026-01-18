-- Password Reset Utility Script
-- Use this to securely reset a user's password in the database

-- Example: Reset password to 'NewPassword123'
-- First, generate the hash using Node.js bcrypt (run in Node REPL):
-- const bcrypt = require('bcryptjs');
-- bcrypt.hash('NewPassword123', 10).then(hash => console.log(hash));

-- Then update the user:
-- UPDATE users 
-- SET password_hash = 'PASTE_HASH_HERE',
--     updated_at = CURRENT_TIMESTAMP
-- WHERE email = 'user@example.com';

-- For development/testing only - Reset to default password 'password123'
-- WARNING: Never use this in production!
UPDATE users 
SET password_hash = '$2a$10$rGHvQqJ9Z5vYxJ5X5YxJ5.YxJ5X5YxJ5X5YxJ5X5YxJ5X5YxJ5X5Y',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'aikugreen02@gmail.com';

-- Verify the update
SELECT email, 
       SUBSTRING(password_hash, 1, 20) as hash_preview,
       updated_at 
FROM users 
WHERE email = 'aikugreen02@gmail.com';
