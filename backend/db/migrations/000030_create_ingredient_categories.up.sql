-- 000030_create_ingredient_categories.up.sql

-- 1. Create ingredient_categories table
CREATE TABLE IF NOT EXISTS ingredient_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Add category_id to ingredients table
ALTER TABLE ingredients
ADD COLUMN IF NOT EXISTS category_id UUID NULL;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_ingredients_category') THEN
        ALTER TABLE ingredients 
        ADD CONSTRAINT fk_ingredients_category 
        FOREIGN KEY (category_id) REFERENCES ingredient_categories(id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ingredients_category_id ON ingredients(category_id);

-- 3. Seed Default Master Categories for Raw Materials
INSERT INTO ingredient_categories (name, code, description, sort_order)
VALUES
    ('Meat & Poultry', 'MEAT', 'Fresh beef, pork, chicken and poultry cuts', 1),
    ('Seafood', 'SEAFOOD', 'Fresh and frozen fish, shrimp, crab and seafood', 2),
    ('Produce (Fruits & Veg)', 'PRODUCE', 'Fresh vegetables, herbs, greens and fruits', 3),
    ('Dairy & Eggs', 'DAIRY', 'Milk, cheeses, butters, creams and fresh eggs', 4),
    ('Dry Goods & Grains', 'DRY_GOODS', 'Rice, noodles, flours, sugars, salt and beans', 5),
    ('Sauces & Seasonings', 'SAUCES', 'Oils, soy sauces, spices, seasonings and condiments', 6),
    ('Bar & Beverage Bases', 'BAR_BASE', 'Coffee beans, tea leaves, syrups, drink purees and bar bases', 7),
    ('Packaging & Disposables', 'PACKAGING', 'Takeout boxes, drink cups, straws, napkins and bags', 8)
ON CONFLICT (code) DO NOTHING;
