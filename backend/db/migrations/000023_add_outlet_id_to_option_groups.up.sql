-- Migration 000023: Add outlet_id to option_groups table
ALTER TABLE option_groups ADD COLUMN IF NOT EXISTS outlet_id BIGINT NULL;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_option_groups_outlet') THEN
        ALTER TABLE option_groups ADD CONSTRAINT fk_option_groups_outlet FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE SET NULL;
    END IF;
END $$;
