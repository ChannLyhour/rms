-- Migration 000023 rollback
ALTER TABLE option_groups DROP CONSTRAINT IF EXISTS fk_option_groups_outlet;
ALTER TABLE option_groups DROP COLUMN IF EXISTS outlet_id;
