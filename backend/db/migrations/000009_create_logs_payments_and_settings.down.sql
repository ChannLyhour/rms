-- Migration 000009: Drop system_settings, order_status_logs, payments, stock_wastes, ingredient_stock_logs, and product_stock_logs tables

DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS order_status_logs CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS stock_wastes CASCADE;
DROP TABLE IF EXISTS ingredient_stock_logs CASCADE;
DROP TABLE IF EXISTS product_stock_logs CASCADE;
