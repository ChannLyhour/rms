-- Migration 000024: Add item_product_name to order_items table
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS item_product_name VARCHAR(255) NULL;

-- Backfill item_product_name from products table for existing rows
UPDATE order_items oi
SET item_product_name = p.name
FROM products p
WHERE oi.product_id = p.id AND (oi.item_product_name IS NULL OR oi.item_product_name = '');
