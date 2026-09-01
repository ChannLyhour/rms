-- Migration 000022 rollback
ALTER TABLE categories DROP CONSTRAINT IF EXISTS fk_categories_outlet;
ALTER TABLE categories DROP COLUMN IF EXISTS outlet_id;
