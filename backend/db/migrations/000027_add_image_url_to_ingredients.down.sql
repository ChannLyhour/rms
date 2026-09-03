-- Migration 000027: Revert image_url column from ingredients table
ALTER TABLE ingredients DROP COLUMN IF EXISTS image_url;
