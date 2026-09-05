-- 000031_add_image_to_ingredient_categories.down.sql
ALTER TABLE ingredient_categories 
DROP COLUMN IF EXISTS image;
