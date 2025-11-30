-- Reset Admin Password SQL Query
-- Run this in phpMyAdmin to reset admin password to 'admin123'

USE school_management;

-- Update existing user or create if doesn't exist
-- This hash is for password: admin123
-- Generated using: password_hash('admin123', PASSWORD_BCRYPT)

UPDATE users 
SET password = '$2y$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy' 
WHERE email = 'admin@school.com';

-- If user doesn't exist, create it
INSERT INTO users (email, password, role) 
SELECT 'admin@school.com', '$2y$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'super_admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@school.com');

