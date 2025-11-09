-- Migration: Add avatar_url column to customers table
-- Purpose: Support avatar images for customer personas
-- Location: migrations/15_add_customer_avatars.sql

-- Add avatar_url column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'customers' 
        AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE customers ADD COLUMN avatar_url TEXT;
        COMMENT ON COLUMN customers.avatar_url IS 'Path to avatar image file in /public/avatars/ directory';
    END IF;
END $$;

