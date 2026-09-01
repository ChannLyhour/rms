-- Migration 000010: Drop updated_at triggers

DROP TRIGGER IF EXISTS set_roles_updated_at ON roles;
DROP TRIGGER IF EXISTS set_permissions_updated_at ON permissions;
DROP TRIGGER IF EXISTS set_users_updated_at ON users;
DROP TRIGGER IF EXISTS set_categories_updated_at ON categories;
DROP TRIGGER IF EXISTS set_products_updated_at ON products;
DROP TRIGGER IF EXISTS set_option_groups_updated_at ON option_groups;
DROP TRIGGER IF EXISTS set_option_values_updated_at ON option_values;
DROP TRIGGER IF EXISTS set_suppliers_updated_at ON suppliers;
DROP TRIGGER IF EXISTS set_ingredients_updated_at ON ingredients;
DROP TRIGGER IF EXISTS set_recipes_updated_at ON recipes;
DROP TRIGGER IF EXISTS set_purchase_orders_updated_at ON purchase_orders;
DROP TRIGGER IF EXISTS set_tables_updated_at ON tables;
DROP TRIGGER IF EXISTS set_orders_updated_at ON orders;
DROP TRIGGER IF EXISTS set_order_items_updated_at ON order_items;
DROP TRIGGER IF EXISTS set_system_settings_updated_at ON system_settings;
