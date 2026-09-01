-- Migration 000002: Drop users table and related foreign key constraints

ALTER TABLE IF EXISTS roles DROP CONSTRAINT IF EXISTS fk_roles_created_by;
ALTER TABLE IF EXISTS permissions DROP CONSTRAINT IF EXISTS fk_permissions_created_by;
ALTER TABLE IF EXISTS role_permissions DROP CONSTRAINT IF EXISTS fk_rp_created_by;

DROP TABLE IF EXISTS users CASCADE;
