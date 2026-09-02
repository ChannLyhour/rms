-- Migration 000026: Convert all tables from BIGINT to native UUID (uuid.UUID)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS "stock_wastes" CASCADE;
DROP TABLE IF EXISTS "ingredient_stock_logs" CASCADE;
DROP TABLE IF EXISTS "product_stock_logs" CASCADE;
DROP TABLE IF EXISTS "purchase_order_items" CASCADE;
DROP TABLE IF EXISTS "purchase_orders" CASCADE;
DROP TABLE IF EXISTS "recipes" CASCADE;
DROP TABLE IF EXISTS "ingredients" CASCADE;
DROP TABLE IF EXISTS "suppliers" CASCADE;
DROP TABLE IF EXISTS "payments" CASCADE;
DROP TABLE IF EXISTS "order_status_logs" CASCADE;
DROP TABLE IF EXISTS "order_item_options" CASCADE;
DROP TABLE IF EXISTS "order_items" CASCADE;
DROP TABLE IF EXISTS "orders" CASCADE;
DROP TABLE IF EXISTS "table_sessions" CASCADE;
DROP TABLE IF EXISTS "tables" CASCADE;
DROP TABLE IF EXISTS "product_image" CASCADE;
DROP TABLE IF EXISTS "media" CASCADE;
DROP TABLE IF EXISTS "product_option_group" CASCADE;
DROP TABLE IF EXISTS "option_values" CASCADE;
DROP TABLE IF EXISTS "option_groups" CASCADE;
DROP TABLE IF EXISTS "products" CASCADE;
DROP TABLE IF EXISTS "categories" CASCADE;
DROP TABLE IF EXISTS "stations" CASCADE;
DROP TABLE IF EXISTS "zones" CASCADE;
DROP TABLE IF EXISTS "user_outlets" CASCADE;
DROP TABLE IF EXISTS "outlets" CASCADE;
DROP TABLE IF EXISTS "role_permissions" CASCADE;
DROP TABLE IF EXISTS "permissions" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "roles" CASCADE;
DROP TABLE IF EXISTS "system_settings" CASCADE;

-- 1. Roles
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Permissions
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Role Permissions
CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_by UUID,
    PRIMARY KEY (role_id, permission_id)
);

-- 4. Outlets
CREATE TABLE outlets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'dine_in',
    description TEXT,
    has_tables BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Zones
CREATE TABLE zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    floor_number INT DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Stations
CREATE TABLE stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'kds',
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    image_url TEXT,
    password VARCHAR(255) NOT NULL,
    token TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. User Outlets
CREATE TABLE user_outlets (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, outlet_id)
);

-- 9. Media
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_type VARCHAR(50),
    file_size BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. Categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

-- 11. Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL,
    station_id UUID REFERENCES stations(id) ON DELETE SET NULL,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    barcode VARCHAR(100),
    description TEXT,
    price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    cost_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage',
    discount_value NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    discount_pct NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    stock_quantity INT DEFAULT 0,
    low_stock_threshold INT DEFAULT 5,
    track_stock BOOLEAN DEFAULT false,
    image_products_id UUID REFERENCES media(id) ON DELETE SET NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    kitchen_station VARCHAR(100) DEFAULT 'Kitchen',
    prep_time_mins INT DEFAULT 15,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

-- 12. Product Image Gallery
CREATE TABLE product_image (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 13. Option Groups & Values
CREATE TABLE option_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) DEFAULT 'single',
    is_required BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE option_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    option_group_id UUID NOT NULL REFERENCES option_groups(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(10,2) DEFAULT 0.00,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_option_group (
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    option_group_id UUID NOT NULL REFERENCES option_groups(id) ON DELETE CASCADE,
    created_by UUID,
    PRIMARY KEY (product_id, option_group_id)
);

-- 14. Tables & Table Sessions
CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL,
    zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
    table_number VARCHAR(50) UNIQUE NOT NULL,
    capacity INT DEFAULT 4,
    status VARCHAR(20) DEFAULT 'available',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE table_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    opened_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 15. Orders & Order Items
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL,
    table_session_id UUID REFERENCES table_sessions(id) ON DELETE SET NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    order_type VARCHAR(20) DEFAULT 'qr_scan',
    status VARCHAR(20) DEFAULT 'pending',
    payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid',
    payment_method VARCHAR(50),
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    accepted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    accepted_role VARCHAR(50),
    accepted_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    item_product_name VARCHAR(255),
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    special_instructions TEXT,
    item_status VARCHAR(20) DEFAULT 'pending',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_item_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    option_value_id UUID NOT NULL REFERENCES option_values(id) ON DELETE RESTRICT,
    price NUMERIC(10,2) DEFAULT 0.00,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 16. Payments & Logs
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    table_session_id UUID REFERENCES table_sessions(id) ON DELETE SET NULL,
    cashier_id UUID REFERENCES users(id) ON DELETE SET NULL,
    payment_method VARCHAR(20) NOT NULL DEFAULT 'cash',
    amount_paid NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    change_given NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'paid',
    transaction_ref VARCHAR(255),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    paid_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_status_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    changed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status_from VARCHAR(50) NOT NULL,
    status_to VARCHAR(50) NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 17. Inventory (Suppliers, Ingredients, Recipes, POs, Stock Logs, Waste)
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    stock_quantity NUMERIC(10,3) DEFAULT 0.000,
    low_stock_threshold NUMERIC(10,3) DEFAULT 5.000,
    cost_per_unit NUMERIC(10,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    option_value_id UUID REFERENCES option_values(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    quantity_required NUMERIC(10,3) NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    total_amount NUMERIC(10,2) DEFAULT 0.00,
    expected_delivery_date VARCHAR(50),
    received_at TIMESTAMPTZ,
    notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    ingredient_id UUID REFERENCES ingredients(id) ON DELETE SET NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity_ordered NUMERIC(10,3) NOT NULL,
    quantity_received NUMERIC(10,3) DEFAULT 0.000,
    unit_cost NUMERIC(10,2) DEFAULT 0.00,
    subtotal NUMERIC(10,2) DEFAULT 0.00
);

CREATE TABLE product_stock_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL,
    quantity INT NOT NULL,
    quantity_after INT NOT NULL,
    note TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ingredient_stock_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL,
    quantity NUMERIC(10,3) NOT NULL,
    quantity_after NUMERIC(10,3) NOT NULL,
    note TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stock_wastes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ingredient_id UUID REFERENCES ingredients(id) ON DELETE SET NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity NUMERIC(10,3) NOT NULL,
    reason VARCHAR(100) NOT NULL,
    cost_loss NUMERIC(10,2) DEFAULT 0.00,
    reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 18. System Settings
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ════════════════════════════════════════════════════════════════════
-- SEED DEFAULT DATA WITH PRESET UUIDs
-- ════════════════════════════════════════════════════════════════════

-- Seed Roles
INSERT INTO roles (id, name, display_name, description) VALUES
('00000000-0000-0000-0000-000000000001', 'admin', 'Administrator', 'Full access to all system features'),
('00000000-0000-0000-0000-000000000002', 'cashier', 'Cashier', 'Can manage tables, sessions, orders, and payments'),
('00000000-0000-0000-0000-000000000003', 'kitchen', 'Kitchen Staff', 'Can view and update order kitchen status')
ON CONFLICT (id) DO NOTHING;

-- Seed Permissions
INSERT INTO permissions (id, slug, name, module) VALUES
('00000000-0000-0000-0001-000000000001', 'users.manage', 'Manage Users & Roles', 'users'),
('00000000-0000-0000-0001-000000000002', 'menu.manage', 'Manage Categories & Menu Items', 'menu'),
('00000000-0000-0000-0001-000000000003', 'tables.manage', 'Manage Tables & Open Sessions', 'tables'),
('00000000-0000-0000-0001-000000000004', 'orders.create', 'Create Orders', 'orders'),
('00000000-0000-0000-0001-000000000005', 'orders.kitchen_view', 'View & Update Kitchen Orders', 'orders'),
('00000000-0000-0000-0001-000000000006', 'payments.process', 'Process Payments & Close Sessions', 'payments'),
('00000000-0000-0000-0001-000000000007', 'stock.manage', 'Manage Product Inventory & Restock', 'inventory'),
('00000000-0000-0000-0001-000000000008', 'suppliers.manage', 'Manage Suppliers & Vendors', 'inventory'),
('00000000-0000-0000-0001-000000000009', 'ingredients.manage', 'Manage Ingredients & Recipes', 'inventory'),
('00000000-0000-0000-0001-000000000010', 'po.manage', 'Manage Purchase Orders', 'inventory'),
('00000000-0000-0000-0001-000000000011', 'stock.waste', 'Record Stock Waste & Loss', 'inventory')
ON CONFLICT (id) DO NOTHING;

-- Seed Role Permissions
INSERT INTO role_permissions (role_id, permission_id) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000001'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000002'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000003'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000004'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000005'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000006'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000007'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000008'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000009'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000010'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000011'),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0001-000000000003'),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0001-000000000004'),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0001-000000000006'),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0001-000000000005')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Seed Outlets
INSERT INTO outlets (id, name, code, type, description, has_tables, is_active) VALUES
('20000000-0000-0000-0000-000000000001', 'Main Restaurant', 'REST', 'dine_in', 'Main dining hall and terrace', true, true),
('20000000-0000-0000-0000-000000000002', 'Cafe & Bakery', 'CAFE', 'cafe', 'Specialty coffee and pastries', true, true),
('20000000-0000-0000-0000-000000000003', 'Rooftop Bar', 'BAR', 'bar', 'Cocktails, wine, and craft beer', true, true)
ON CONFLICT (id) DO NOTHING;

-- Seed Stations
INSERT INTO stations (id, outlet_id, name, type) VALUES
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Main Kitchen KDS', 'kds'),
('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'Bar Station', 'kds'),
('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'Barista Counter', 'kds')
ON CONFLICT (id) DO NOTHING;

-- Seed Users ($2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi = "password")
INSERT INTO users (id, role_id, outlet_id, name, username, email, password, is_active) VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Admin User', 'admin', 'admin@pos.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', true),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'Cashier Main', 'cashier', 'cashier@pos.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', true),
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'Kitchen Chief', 'kitchen', 'kitchen@pos.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', true)
ON CONFLICT (id) DO NOTHING;

-- Seed User Outlets
INSERT INTO user_outlets (user_id, outlet_id) VALUES
('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001'),
('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002'),
('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003'),
('10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001'),
('10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001')
ON CONFLICT (user_id, outlet_id) DO NOTHING;

-- Seed Tables
INSERT INTO tables (id, outlet_id, table_number, capacity, status) VALUES
('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '1', 4, 'available'),
('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '2', 2, 'available'),
('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', '3', 4, 'available'),
('40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', '4', 6, 'available'),
('40000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000001', '5', 4, 'available'),
('40000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000001', '6', 2, 'available'),
('40000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000001', '7', 8, 'available'),
('40000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000001', '8', 4, 'available'),
('40000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000001', '9', 4, 'available'),
('40000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000001', '10', 6, 'available')
ON CONFLICT (id) DO NOTHING;

-- Seed Categories
INSERT INTO categories (id, outlet_id, name, description, image_url, sort_order, is_active) VALUES
('50000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Special', 'Chef signature entrees, premium cuts and house specialties', '🍲', 1, true),
('50000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'Soups', 'Hot and savory comforting soups and broths', '🥣', 2, true),
('50000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'Chickens', 'Golden roasted, crispy and glazed chicken dishes', '🍗', 3, true),
('50000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', 'Main Course', 'Artisanal smash burgers, bowls and hearty entrees', '🍔', 4, true),
('50000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000001', 'Pasta & Pizza', 'Hand-tossed stone baked pizzas and fresh pasta', '🍕', 5, true),
('50000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000001', 'Desserts', 'Artisanal molten cakes, pancakes and sweets', '🍰', 6, true),
('50000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000001', 'Drinks', 'Freshly brewed coffees, iced matcha and cold pressed juices', '☕', 7, true)
ON CONFLICT (id) DO NOTHING;

-- Seed Products
INSERT INTO products (id, outlet_id, station_id, category_id, name, description, price, stock_quantity, low_stock_threshold, track_stock, image_url, is_available) VALUES
('60000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'Grilled Salmon Steak', 'Fresh Atlantic salmon fillet with asparagus and lemon butter sauce', 15.00, 50, 5, true, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop&q=80', true),
('60000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'Tofu Poke Bowl', 'Organic tofu, avocado, edamame, seaweed and sesame ginger dressing', 7.00, 40, 5, true, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80', true),
('60000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'Wagyu Beef Ribeye', 'A5 Wagyu beef grilled to perfection with truffle mashed potatoes', 28.50, 25, 3, true, 'https://images.unsplash.com/photo-1558030006-450675393462?w=500&auto=format&fit=crop&q=80', true),
('60000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', 'Creamy Mushroom Soup', 'Wild forest mushrooms simmered in velvet cream with herbs', 7.50, 60, 10, true, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&auto=format&fit=crop&q=80', true),
('60000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', 'Tom Yum Seafood Soup', 'Spicy and sour Thai soup with tiger prawns, squid and lemongrass', 9.00, 45, 8, true, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=80', true),
('60000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000003', 'Crispy Roasted Chicken', 'Golden roasted whole chicken glazed with rosemary and garlic', 12.00, 30, 5, true, 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=500&auto=format&fit=crop&q=80', true),
('60000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000003', 'Spicy BBQ Chicken Wings', '8pcs smoky chicken wings tossed in signature fiery BBQ glaze', 8.50, 50, 10, true, 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&auto=format&fit=crop&q=80', true),
('60000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000004', 'Classic Cheeseburger', 'Angus beef patty with cheddar cheese, caramelized onions and secret sauce', 11.50, 70, 10, true, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80', true),
('60000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000004', 'Shrimp Fried Rice Bowl', 'Jasmine rice wok-tossed with fresh prawns, eggs and spring onions', 6.00, 80, 15, true, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&auto=format&fit=crop&q=80', true),
('60000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000005', 'Pasta with Roast Beef', 'Fettuccine in slow-cooked tender beef ragu and grated parmesan', 10.00, 40, 5, true, 'https://images.unsplash.com/photo-1621996346565-e3d5d6281e04?w=500&auto=format&fit=crop&q=80', true),
('60000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000005', 'Margherita Pizza', 'Stone-baked pizza with San Marzano tomatoes, mozzarella and fresh basil', 14.50, 35, 5, true, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=80', true),
('60000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000006', 'Apple Stuffed Pancake', 'Fluffy pancake stacks stuffed with cinnamon caramelized apples', 6.50, 40, 5, true, 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=500&auto=format&fit=crop&q=80', true),
('60000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000006', 'Chocolate Lava Cake', 'Rich Belgian molten chocolate cake served with vanilla bean gelato', 7.99, 50, 8, true, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80', true),
('60000000-0000-0000-0000-000000000014', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000007', 'Iced Matcha Latte', 'Ceremonial grade Japanese Uji matcha with oat milk', 4.50, 100, 20, true, 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=80', true),
('60000000-0000-0000-0000-000000000015', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000007', 'Fresh Orange Juice', '100% cold-pressed Valencia oranges without added sugar', 3.50, 100, 20, true, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&auto=format&fit=crop&q=80', true)
ON CONFLICT (id) DO NOTHING;

-- Seed Option Groups & Values
INSERT INTO option_groups (id, outlet_id, name, type, is_required) VALUES
('70000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Portion Size', 'single', false),
('70000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'Spice Level', 'single', false),
('70000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'Sweetness', 'single', false),
('70000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', 'Ice Level', 'single', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO option_values (id, option_group_id, name, price) VALUES
('70000000-0000-0000-0001-000000000001', '70000000-0000-0000-0000-000000000001', 'Regular Size', 0.00),
('70000000-0000-0000-0001-000000000002', '70000000-0000-0000-0000-000000000001', 'Large Size', 1.50),
('70000000-0000-0000-0001-000000000003', '70000000-0000-0000-0000-000000000002', 'Mild / Not Spicy', 0.00),
('70000000-0000-0000-0001-000000000004', '70000000-0000-0000-0000-000000000002', 'Medium Spicy', 0.00),
('70000000-0000-0000-0001-000000000005', '70000000-0000-0000-0000-000000000002', 'Extra Hot', 0.50),
('70000000-0000-0000-0001-000000000006', '70000000-0000-0000-0000-000000000003', '100% Normal Sugar', 0.00),
('70000000-0000-0000-0001-000000000007', '70000000-0000-0000-0000-000000000003', '50% Less Sugar', 0.00),
('70000000-0000-0000-0001-000000000008', '70000000-0000-0000-0000-000000000003', '0% No Sugar', 0.00),
('70000000-0000-0000-0001-000000000009', '70000000-0000-0000-0000-000000000004', 'Regular Ice', 0.00),
('70000000-0000-0000-0001-000000000010', '70000000-0000-0000-0000-000000000004', 'Less Ice', 0.00),
('70000000-0000-0000-0001-000000000011', '70000000-0000-0000-0000-000000000004', 'No Ice', 0.00)
ON CONFLICT (id) DO NOTHING;

-- Seed Product Option Groups
INSERT INTO product_option_group (product_id, option_group_id) VALUES
('60000000-0000-0000-0000-000000000008', '70000000-0000-0000-0000-000000000001'),
('60000000-0000-0000-0000-000000000007', '70000000-0000-0000-0000-000000000002'),
('60000000-0000-0000-0000-000000000014', '70000000-0000-0000-0000-000000000003'),
('60000000-0000-0000-0000-000000000014', '70000000-0000-0000-0000-000000000004')
ON CONFLICT (product_id, option_group_id) DO NOTHING;
