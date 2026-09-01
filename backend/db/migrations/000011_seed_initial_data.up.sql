-- Migration 000011: Seed initial roles, permissions, role-permissions, and default users

INSERT INTO roles (id, name, display_name, description) VALUES
(1, 'admin', 'Administrator', 'Full access to all system features'),
(2, 'cashier', 'Cashier', 'Can manage tables, sessions, orders, and payments'),
(3, 'kitchen', 'Kitchen Staff', 'Can view and update order kitchen status')
ON CONFLICT (id) DO NOTHING;

SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));

INSERT INTO permissions (id, slug, name, module) VALUES
(1, 'users.manage', 'Manage Users & Roles', 'users'),
(2, 'menu.manage', 'Manage Categories & Menu Items', 'menu'),
(3, 'tables.manage', 'Manage Tables & Open Sessions', 'tables'),
(4, 'orders.create', 'Create Orders', 'orders'),
(5, 'orders.kitchen_view', 'View & Update Kitchen Orders', 'orders'),
(6, 'payments.process', 'Process Payments & Close Sessions', 'payments'),
(7, 'stock.manage', 'Manage Product Inventory & Restock', 'inventory'),
(8, 'suppliers.manage', 'Manage Suppliers & Vendors', 'inventory'),
(9, 'ingredients.manage', 'Manage Ingredients & Recipes', 'inventory'),
(10, 'po.manage', 'Manage Purchase Orders', 'inventory'),
(11, 'stock.waste', 'Record Stock Waste & Loss', 'inventory')
ON CONFLICT (id) DO NOTHING;

SELECT setval('permissions_id_seq', (SELECT MAX(id) FROM permissions));

INSERT INTO role_permissions (role_id, permission_id) VALUES 
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10), (1, 11),
(2, 3), (2, 4), (2, 6),
(3, 5)
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO users (id, role_id, name, username, email, password) VALUES 
(1, 1, 'Admin User', 'admin', 'admin@pos.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
(2, 2, 'Cashier Main', 'cashier', 'cashier@pos.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
(3, 3, 'Kitchen Chief', 'kitchen', 'kitchen@pos.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON CONFLICT (id) DO NOTHING;

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
