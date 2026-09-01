-- Migration 000021: Add description column to permissions table
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS description VARCHAR(255) NULL;
