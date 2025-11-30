-- Add media table for MediaLibrary component
-- This table stores a single document with id='library' containing a files array

USE school_management;

-- Drop existing media table if it exists (if you need to recreate)
-- DROP TABLE IF EXISTS media;

CREATE TABLE IF NOT EXISTS media (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'library',
    files TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert initial empty library if it doesn't exist
INSERT IGNORE INTO media (id, files) VALUES ('library', '[]');

