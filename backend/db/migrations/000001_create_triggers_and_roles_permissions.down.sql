-- Migration 000001: Drop role_permissions, permissions, roles, and trigger function

DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
