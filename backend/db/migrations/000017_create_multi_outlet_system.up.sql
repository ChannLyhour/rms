-- 000017_create_multi_outlet_system.up.sql

-- 1. Create Outlets Table (Market, Cafe, Bar, Restaurant, Residence)
CREATE TABLE IF NOT EXISTS outlets (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'dine_in', -- 'cafe', 'bar', 'retail', 'dine_in'
    description TEXT,
    has_tables BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Zones / Floors Table
CREATE TABLE IF NOT EXISTS zones (
    id BIGSERIAL PRIMARY KEY,
    outlet_id BIGINT REFERENCES outlets(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    floor_number INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Stations Table (KDS, Barista, Bar, Kitchen Printer Routing)
CREATE TABLE IF NOT EXISTS stations (
    id BIGSERIAL PRIMARY KEY,
    outlet_id BIGINT REFERENCES outlets(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'kds', -- 'kds', 'printer', 'cashier'
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Alter Existing Tables to Support Multi-Outlet Architecture
ALTER TABLE tables
ADD COLUMN IF NOT EXISTS outlet_id BIGINT REFERENCES outlets(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS zone_id BIGINT REFERENCES zones(id) ON DELETE SET NULL;

ALTER TABLE categories
ADD COLUMN IF NOT EXISTS outlet_id BIGINT REFERENCES outlets(id) ON DELETE SET NULL;

ALTER TABLE products
ADD COLUMN IF NOT EXISTS outlet_id BIGINT REFERENCES outlets(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS barcode VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_kitchen_required BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS station_id BIGINT REFERENCES stations(id) ON DELETE SET NULL;

-- Make table_session_id nullable on orders for direct retail/counter orders (like Mart / Quick Cafe)
ALTER TABLE orders
ALTER COLUMN table_session_id DROP NOT NULL;

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS outlet_id BIGINT REFERENCES outlets(id) ON DELETE SET NULL;

-- 5. Seed SKYPARK Default Outlets & Stations
INSERT INTO outlets (id, name, code, type, description, has_tables, is_active)
VALUES 
    (1, 'SKYPARK Cafe', 'CAFE', 'cafe', 'Artisan Coffee, Bakery, Pastries & Quick Refreshments', true, true),
    (2, 'SKYPARK SkyBar & Lounge', 'BAR', 'bar', 'Rooftop Cocktails, Wine, Craft Spirits & Nightlife Lounge', true, true),
    (3, 'SKYPARK Mart', 'MART', 'retail', 'Residence Supermarket, Snacks, Groceries & Daily Essentials', false, true),
    (4, 'SKYPARK Grand Restaurant', 'REST', 'dine_in', 'Fine Dining, Multi-course Cuisine & Banquet Residence Dining', true, true)
ON CONFLICT (code) DO NOTHING;

-- Reset sequence for outlets
SELECT setval(pg_get_serial_sequence('outlets', 'id'), COALESCE((SELECT MAX(id) FROM outlets), 1));

-- Seed Default Zones
INSERT INTO zones (id, outlet_id, name, floor_number)
VALUES
    (1, 1, 'Ground Floor Cafe Terrace', 1),
    (2, 2, 'Rooftop SkyBar 45F', 45),
    (3, 4, 'Main Dining Hall', 2)
ON CONFLICT DO NOTHING;

SELECT setval(pg_get_serial_sequence('zones', 'id'), COALESCE((SELECT MAX(id) FROM zones), 1));

-- Seed Default Stations
INSERT INTO stations (id, outlet_id, name, type)
VALUES
    (1, 1, 'Coffee Barista KDS', 'kds'),
    (2, 2, 'Cocktail Bar Station', 'kds'),
    (3, 4, 'Main Kitchen KDS', 'kds')
ON CONFLICT DO NOTHING;

SELECT setval(pg_get_serial_sequence('stations', 'id'), COALESCE((SELECT MAX(id) FROM stations), 1));

-- Map existing tables, categories, products to default outlet
UPDATE tables SET outlet_id = 4 WHERE outlet_id IS NULL;
UPDATE categories SET outlet_id = 4 WHERE outlet_id IS NULL;
UPDATE products SET outlet_id = 4 WHERE outlet_id IS NULL;
UPDATE orders SET outlet_id = 4 WHERE outlet_id IS NULL;
