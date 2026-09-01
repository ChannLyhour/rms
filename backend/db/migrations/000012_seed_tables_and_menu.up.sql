-- Migration 000012: Seed restaurant physical tables, menu categories, products, option groups, and values

-- 1. Tables (10 Tables)
INSERT INTO tables (id, table_number, capacity, status) VALUES 
(1, '1', 4, 'available'),
(2, '2', 2, 'available'),
(3, '3', 4, 'available'),
(4, '4', 6, 'available'),
(5, '5', 4, 'available'),
(6, '6', 2, 'available'),
(7, '7', 8, 'available'),
(8, '8', 4, 'available'),
(9, '9', 4, 'available'),
(10, '10', 6, 'available')
ON CONFLICT (id) DO NOTHING;

SELECT setval('tables_id_seq', (SELECT MAX(id) FROM tables));

-- 2. Categories
INSERT INTO categories (id, name, description, image_url, sort_order, is_active) VALUES 
(1, 'Special', 'Chef signature entrees, premium cuts and house specialties', '🍲', 1, true),
(2, 'Soups', 'Hot and savory comforting soups and broths', '🥣', 2, true),
(3, 'Chickens', 'Golden roasted, crispy and glazed chicken dishes', '🍗', 3, true),
(4, 'Main Course', 'Artisanal smash burgers, bowls and hearty entrees', '🍔', 4, true),
(5, 'Pasta & Pizza', 'Hand-tossed stone baked pizzas and fresh pasta', '🍕', 5, true),
(6, 'Desserts', 'Artisanal molten cakes, pancakes and sweets', '🍰', 6, true),
(7, 'Drinks', 'Freshly brewed coffees, iced matcha and cold pressed juices', '☕', 7, true)
ON CONFLICT (id) DO NOTHING;

SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));

-- 3. Products
INSERT INTO products (id, category_id, name, description, price, stock_quantity, low_stock_threshold, track_stock, image_url, is_available) VALUES 
(1, 1, 'Grilled Salmon Steak', 'Fresh Atlantic salmon fillet with asparagus and lemon butter sauce', 15.00, 50, 5, true, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop&q=80', true),
(2, 1, 'Tofu Poke Bowl', 'Organic tofu, avocado, edamame, seaweed and sesame ginger dressing', 7.00, 40, 5, true, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80', true),
(3, 1, 'Wagyu Beef Ribeye', 'A5 Wagyu beef grilled to perfection with truffle mashed potatoes', 28.50, 25, 3, true, 'https://images.unsplash.com/photo-1558030006-450675393462?w=500&auto=format&fit=crop&q=80', true),
(4, 2, 'Creamy Mushroom Soup', 'Wild forest mushrooms simmered in velvet cream with herbs', 7.50, 60, 10, true, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&auto=format&fit=crop&q=80', true),
(5, 2, 'Tom Yum Seafood Soup', 'Spicy and sour Thai soup with tiger prawns, squid and lemongrass', 9.00, 45, 8, true, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=80', true),
(6, 3, 'Crispy Roasted Chicken', 'Golden roasted whole chicken glazed with rosemary and garlic', 12.00, 30, 5, true, 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=500&auto=format&fit=crop&q=80', true),
(7, 3, 'Spicy BBQ Chicken Wings', '8pcs smoky chicken wings tossed in signature fiery BBQ glaze', 8.50, 50, 10, true, 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&auto=format&fit=crop&q=80', true),
(8, 4, 'Classic Cheeseburger', 'Angus beef patty with cheddar cheese, caramelized onions and secret sauce', 11.50, 70, 10, true, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80', true),
(9, 4, 'Shrimp Fried Rice Bowl', 'Jasmine rice wok-tossed with fresh prawns, eggs and spring onions', 6.00, 80, 15, true, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&auto=format&fit=crop&q=80', true),
(10, 5, 'Pasta with Roast Beef', 'Fettuccine in slow-cooked tender beef ragu and grated parmesan', 10.00, 40, 5, true, 'https://images.unsplash.com/photo-1621996346565-e3d5d6281e04?w=500&auto=format&fit=crop&q=80', true),
(11, 5, 'Margherita Pizza', 'Stone-baked pizza with San Marzano tomatoes, mozzarella and fresh basil', 14.50, 35, 5, true, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=80', true),
(12, 6, 'Apple Stuffed Pancake', 'Fluffy pancake stacks stuffed with cinnamon caramelized apples', 6.50, 40, 5, true, 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=500&auto=format&fit=crop&q=80', true),
(13, 6, 'Chocolate Lava Cake', 'Rich Belgian molten chocolate cake served with vanilla bean gelato', 7.99, 50, 8, true, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80', true),
(14, 7, 'Iced Matcha Latte', 'Ceremonial grade Japanese Uji matcha with oat milk', 4.50, 100, 20, true, 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=80', true),
(15, 7, 'Fresh Orange Juice', '100% cold-pressed Valencia oranges without added sugar', 3.50, 100, 20, true, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&auto=format&fit=crop&q=80', true)
ON CONFLICT (id) DO NOTHING;

SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

-- 4. Option Groups
INSERT INTO option_groups (id, name, type, is_required) VALUES 
(1, 'Portion Size', 'single', false),
(2, 'Spice Level', 'single', false),
(3, 'Sweetness', 'single', false),
(4, 'Ice Level', 'single', false)
ON CONFLICT (id) DO NOTHING;

SELECT setval('option_groups_id_seq', (SELECT MAX(id) FROM option_groups));

-- 5. Option Values
INSERT INTO option_values (id, option_group_id, name, price) VALUES 
(1, 1, 'Regular', 0.00),
(2, 1, 'Large (+ $2.50)', 2.50),
(3, 2, 'Mild', 0.00),
(4, 2, 'Medium Spicy', 0.00),
(5, 2, 'Extra Hot', 0.50),
(6, 3, '100% Normal', 0.00),
(7, 3, '50% Less Sugar', 0.00),
(8, 3, '0% No Sugar', 0.00),
(9, 4, 'Regular Ice', 0.00),
(10, 4, 'Less Ice', 0.00),
(11, 4, 'No Ice', 0.00)
ON CONFLICT (id) DO NOTHING;

SELECT setval('option_values_id_seq', (SELECT MAX(id) FROM option_values));

-- 6. Link Products with Option Groups
INSERT INTO product_option_group (product_id, option_group_id) VALUES 
(1, 1),
(3, 1),
(5, 2),
(7, 2),
(8, 1),
(9, 1),
(10, 1),
(11, 1),
(14, 3),
(14, 4),
(15, 3),
(15, 4)
ON CONFLICT (product_id, option_group_id) DO NOTHING;
