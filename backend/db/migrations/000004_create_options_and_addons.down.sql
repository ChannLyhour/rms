-- Migration 000004: Drop product_option_group, option_values, and option_groups tables

DROP TABLE IF EXISTS product_option_group CASCADE;
DROP TABLE IF EXISTS option_values CASCADE;
DROP TABLE IF EXISTS option_groups CASCADE;
