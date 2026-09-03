-- Migration 000027: Add image_url to ingredients table
ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS image_url TEXT;
