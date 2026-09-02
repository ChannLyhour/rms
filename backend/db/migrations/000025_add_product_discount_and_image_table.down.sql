-- Migration 000025 Down: Revert product discount and image table changes

DROP TABLE IF EXISTS product_image;
DROP TABLE IF EXISTS media;

ALTER TABLE products
DROP COLUMN IF EXISTS image_products_id,
DROP COLUMN IF EXISTS cost_price,
DROP COLUMN IF EXISTS discount_pct,
DROP COLUMN IF EXISTS discount_value,
DROP COLUMN IF EXISTS discount_type,
DROP COLUMN IF EXISTS station_id;
