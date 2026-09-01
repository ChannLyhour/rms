-- Migration 000014: Change image_url column type to TEXT in products and categories
ALTER TABLE products ALTER COLUMN image_url TYPE TEXT;
ALTER TABLE categories ALTER COLUMN image_url TYPE TEXT;
