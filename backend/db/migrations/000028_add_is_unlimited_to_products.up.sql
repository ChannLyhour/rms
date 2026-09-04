ALTER TABLE products ADD COLUMN IF NOT EXISTS is_unlimited BOOLEAN DEFAULT false;
UPDATE products SET is_unlimited = (NOT track_stock);
