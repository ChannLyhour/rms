-- Migration 000005: Drop recipes, ingredients, and suppliers tables

DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS ingredients CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
