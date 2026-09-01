-- Migration 000022: Add outlet_id to categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS outlet_id BIGINT NULL;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_categories_outlet') THEN
        ALTER TABLE categories ADD CONSTRAINT fk_categories_outlet FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE SET NULL;
    END IF;
END $$;
