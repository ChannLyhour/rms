-- Migration 000013: Add token column to users table

ALTER TABLE users ADD COLUMN IF NOT EXISTS token TEXT NULL;
