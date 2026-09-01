-- Migration 000020: Add image_url, phone, and outlet_id to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS image_url TEXT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS outlet_id BIGINT NULL;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_users_outlet') THEN
        ALTER TABLE users ADD CONSTRAINT fk_users_outlet FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE SET NULL;
    END IF;
END $$;
