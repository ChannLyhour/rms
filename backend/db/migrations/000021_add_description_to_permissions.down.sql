-- Migration 000021 rollback
ALTER TABLE permissions DROP COLUMN IF EXISTS description;
