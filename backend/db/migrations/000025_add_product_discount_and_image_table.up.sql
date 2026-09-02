-- Migration 000025: Add station_id, discount_type, image_products_id, is_featured, kitchen_station, prep_time_mins to products and create media and product_image tables

-- 1. Alter products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS station_id BIGINT REFERENCES stations(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage',
ADD COLUMN IF NOT EXISTS discount_value NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS discount_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS cost_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS kitchen_station VARCHAR(100) DEFAULT 'Kitchen',
ADD COLUMN IF NOT EXISTS prep_time_mins INT DEFAULT 15,
ADD COLUMN IF NOT EXISTS image_products_id BIGINT;

CREATE INDEX IF NOT EXISTS idx_products_station_id ON products(station_id);
CREATE INDEX IF NOT EXISTS idx_products_image_products_id ON products(image_products_id);

-- 2. Create media table
CREATE TABLE IF NOT EXISTS media (
    id BIGSERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    file_name VARCHAR(255) NULL,
    file_type VARCHAR(50) NULL,
    file_size BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create product_image table
CREATE TABLE IF NOT EXISTS product_image (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    media_id BIGINT NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_image_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_product_image_media FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_product_image_product_id ON product_image(product_id);
CREATE INDEX IF NOT EXISTS idx_product_image_media_id ON product_image(media_id);
