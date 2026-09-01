-- 000017_create_multi_outlet_system.down.sql
ALTER TABLE orders DROP COLUMN IF EXISTS order_type, DROP COLUMN IF EXISTS outlet_id;
ALTER TABLE products DROP COLUMN IF EXISTS station_id, DROP COLUMN IF EXISTS is_kitchen_required, DROP COLUMN IF EXISTS barcode, DROP COLUMN IF EXISTS outlet_id;
ALTER TABLE categories DROP COLUMN IF EXISTS outlet_id;
ALTER TABLE restaurant_tables DROP COLUMN IF EXISTS zone_id, DROP COLUMN IF EXISTS outlet_id;
DROP TABLE IF EXISTS stations;
DROP TABLE IF EXISTS zones;
DROP TABLE IF EXISTS outlets;
