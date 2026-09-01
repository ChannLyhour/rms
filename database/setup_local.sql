-- Run as postgres superuser to bootstrap the POS database
-- Creates posuser role and posdb database

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'posuser') THEN
    CREATE ROLE posuser LOGIN PASSWORD 'pospassword';
    RAISE NOTICE 'Created role posuser';
  ELSE
    RAISE NOTICE 'Role posuser already exists';
  END IF;
END
$$;

SELECT 'CREATE DATABASE posdb OWNER posuser'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'posdb')\gexec

GRANT ALL PRIVILEGES ON DATABASE posdb TO posuser;

-- Connect to posdb and grant schema privileges (required for PostgreSQL 15+)
\connect posdb
GRANT ALL ON SCHEMA public TO posuser;
ALTER DATABASE posdb OWNER TO posuser;
