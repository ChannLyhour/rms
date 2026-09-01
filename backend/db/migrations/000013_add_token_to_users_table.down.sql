-- Migration 000013 Down: Remove token column from users table

ALTER TABLE users DROP COLUMN IF EXISTS token;
