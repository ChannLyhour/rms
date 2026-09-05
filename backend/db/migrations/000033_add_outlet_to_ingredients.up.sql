-- 000033_add_outlet_to_ingredients.up.sql

ALTER TABLE ingredients
ADD COLUMN IF NOT EXISTS outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_ingredients_outlet_id ON ingredients(outlet_id);
