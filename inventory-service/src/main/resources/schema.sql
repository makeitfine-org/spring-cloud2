CREATE TABLE IF NOT EXISTS inventory_items (
    id BIGSERIAL PRIMARY KEY,
    product_id VARCHAR(255) NOT NULL UNIQUE,
    quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER NOT NULL DEFAULT 0
);

-- Seed data
INSERT INTO inventory_items (product_id, quantity, reserved_quantity)
VALUES
    ('prod-1', 100, 0),
    ('prod-2', 50, 0),
    ('prod-3', 200, 0)
ON CONFLICT (product_id) DO NOTHING;
