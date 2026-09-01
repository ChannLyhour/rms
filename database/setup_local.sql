-- Run as postgres superuser to bootstrap the POS database
-- Creates posuser role and rms database

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

SELECT 'CREATE DATABASE rms OWNER posuser'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'rms')\gexec

GRANT ALL PRIVILEGES ON DATABASE rms TO posuser;

-- Connect to rms and grant schema privileges (required for PostgreSQL 15+)
\connect rms
GRANT ALL ON SCHEMA public TO posuser;
ALTER DATABASE rms OWNER TO posuser;
