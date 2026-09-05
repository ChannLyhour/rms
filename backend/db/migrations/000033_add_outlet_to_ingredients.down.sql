-- 000033_add_outlet_to_ingredients.down.sql

DROP INDEX IF EXISTS idx_ingredients_outlet_id;

ALTER TABLE ingredients
DROP COLUMN IF EXISTS outlet_id;
