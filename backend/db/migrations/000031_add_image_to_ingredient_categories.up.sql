-- 000031_add_image_to_ingredient_categories.up.sql
ALTER TABLE ingredient_categories 
ADD COLUMN IF NOT EXISTS image VARCHAR(500);
