-- Migration 000018: Rollback soft delete support
DROP INDEX IF EXISTS idx_products_deleted_at;
ALTER TABLE products DROP COLUMN IF EXISTS deleted_at;

DROP INDEX IF EXISTS idx_categories_deleted_at;
ALTER TABLE categories DROP COLUMN IF EXISTS deleted_at;
