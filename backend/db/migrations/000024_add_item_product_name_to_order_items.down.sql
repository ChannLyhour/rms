-- Migration 000024 rollback
ALTER TABLE order_items DROP COLUMN IF EXISTS item_product_name;
