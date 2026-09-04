-- 000030_create_ingredient_categories.down.sql

ALTER TABLE ingredients DROP CONSTRAINT IF EXISTS fk_ingredients_category;
DROP INDEX IF EXISTS idx_ingredients_category_id;
ALTER TABLE ingredients DROP COLUMN IF EXISTS category_id;
DROP TABLE IF EXISTS ingredient_categories;
