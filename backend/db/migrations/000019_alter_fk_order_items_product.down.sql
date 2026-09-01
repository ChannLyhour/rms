-- Migration 000019 rollback: Restore RESTRICT constraint
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS fk_order_items_product;
ALTER TABLE order_items ADD CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT;
