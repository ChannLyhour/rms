-- Migration 000016: Remove payment_status column from orders table
ALTER TABLE orders DROP COLUMN IF EXISTS payment_status;
