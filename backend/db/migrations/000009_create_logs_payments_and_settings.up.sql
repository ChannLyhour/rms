-- Migration 000009: Create product_stock_logs, ingredient_stock_logs, stock_wastes, payments, order_status_logs, and system_settings tables

CREATE TABLE IF NOT EXISTS product_stock_logs (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    order_id BIGINT NULL,
    type VARCHAR(20) NOT NULL,
    quantity INT NOT NULL,
    quantity_after INT NOT NULL,
    note TEXT NULL,
    created_by BIGINT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_psl_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_psl_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    CONSTRAINT fk_psl_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS ingredient_stock_logs (
    id BIGSERIAL PRIMARY KEY,
    ingredient_id BIGINT NOT NULL,
    order_id BIGINT NULL,
    purchase_order_id BIGINT NULL,
    type VARCHAR(20) NOT NULL,
    quantity NUMERIC(10, 3) NOT NULL,
    quantity_after NUMERIC(10, 3) NOT NULL,
    note TEXT NULL,
    created_by BIGINT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_isl_ingredient FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
    CONSTRAINT fk_isl_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    CONSTRAINT fk_isl_po FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE SET NULL,
    CONSTRAINT fk_isl_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS stock_wastes (
    id BIGSERIAL PRIMARY KEY,
    ingredient_id BIGINT NULL,
    product_id BIGINT NULL,
    quantity NUMERIC(10, 3) NOT NULL,
    reason VARCHAR(100) NOT NULL,
    cost_loss NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    reported_by BIGINT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_waste_ingredient FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE SET NULL,
    CONSTRAINT fk_waste_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    CONSTRAINT fk_waste_user FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    table_session_id BIGINT NOT NULL,
    cashier_id BIGINT NULL,
    payment_method VARCHAR(20) NOT NULL DEFAULT 'cash',
    amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    change_given NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'completed',
    transaction_ref VARCHAR(255) NULL,
    created_by BIGINT NULL,
    paid_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_session FOREIGN KEY (table_session_id) REFERENCES table_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_payments_cashier FOREIGN KEY (cashier_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_payments_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS order_status_logs (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    changed_by_user_id BIGINT NULL,
    status_from VARCHAR(50) NOT NULL,
    status_to VARCHAR(50) NOT NULL,
    created_by BIGINT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_logs_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_logs_user FOREIGN KEY (changed_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_logs_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS system_settings (
    id BIGSERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NULL,
    created_by BIGINT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_settings_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
