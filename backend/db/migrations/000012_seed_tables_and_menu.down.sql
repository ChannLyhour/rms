-- Migration 000012: Delete seeded restaurant tables, menu categories, products, option groups, and values

DELETE FROM product_option_group WHERE product_id BETWEEN 1 AND 15;
DELETE FROM option_values WHERE id BETWEEN 1 AND 11;
DELETE FROM option_groups WHERE id BETWEEN 1 AND 4;
DELETE FROM products WHERE id BETWEEN 1 AND 15;
DELETE FROM categories WHERE id BETWEEN 1 AND 7;
DELETE FROM tables WHERE id BETWEEN 1 AND 10;
