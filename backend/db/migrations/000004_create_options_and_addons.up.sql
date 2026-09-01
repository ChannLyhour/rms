-- Migration 000004: Create option_groups, option_values, and product_option_group tables

CREATE TABLE IF NOT EXISTS option_groups (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'single',
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    created_by BIGINT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_option_groups_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS option_values (
    id BIGSERIAL PRIMARY KEY,
    option_group_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_by BIGINT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_option_values_group FOREIGN KEY (option_group_id) REFERENCES option_groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_option_values_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS product_option_group (
    product_id BIGINT NOT NULL,
    option_group_id BIGINT NOT NULL,
    created_by BIGINT NULL,
    PRIMARY KEY (product_id, option_group_id),
    CONSTRAINT fk_pog_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_pog_group FOREIGN KEY (option_group_id) REFERENCES option_groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_pog_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
