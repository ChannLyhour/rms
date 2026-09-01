-- Migration 000014: Revert image_url column type to VARCHAR(255)
ALTER TABLE products ALTER COLUMN image_url TYPE VARCHAR(255);
ALTER TABLE categories ALTER COLUMN image_url TYPE VARCHAR(255);
