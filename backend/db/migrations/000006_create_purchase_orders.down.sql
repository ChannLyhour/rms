-- Migration 000006: Drop purchase_order_items and purchase_orders tables

DROP TABLE IF EXISTS purchase_order_items CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
