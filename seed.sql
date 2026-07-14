-- Seed data for E-Commerce Microservices
-- Target Databases: product_catalog, users, product_recommendations, orders

-- ==========================================
-- 1. Database: product_catalog
-- ==========================================
USE product_catalog;

-- Clean existing data
DELETE FROM products;

-- Insert products (note the column name 'discription' as defined in Hibernate entity)
INSERT INTO products (id, availability, category, discription, price, product_name, image_url) VALUES
(1, 10, 'Unisex', 'Woody aromatic fragrance with cardamom, iris, and violet.', 310.00, 'Le Labo Santal 33', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500&auto=format&fit=crop&q=60'),
(2, 5, 'Women', 'The legendary aldehyde floral bouquet in its classic bottle.', 165.00, 'Chanel No. 5', 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=500&auto=format&fit=crop&q=60'),
(3, 15, 'Men', 'A radically fresh composition, raw and noble all at once.', 145.00, 'Dior Sauvage', 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=500&auto=format&fit=crop&q=60'),
(4, 20, 'Unisex', 'A glamorization of the Romany lifestyle, earthy and woody.', 200.00, 'Byredo Gypsy Water', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500&auto=format&fit=crop&q=60'),
(5, 30, 'Men', 'An olfactory tribute to masculine freedom, woody aromatic.', 150.00, 'Bleu de Chanel', 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&auto=format&fit=crop&q=60'),
(6, 15, 'Unisex', 'Luminous and sophisticated, amber, floral and woody breeze.', 325.00, 'Baccarat Rouge 540', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500&auto=format&fit=crop&q=60'),
(7, 25, 'Unisex', 'One of the most rare, precious, and expensive ingredients.', 285.00, 'Tom Ford Oud Wood', 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=500&auto=format&fit=crop&q=60'),
(8, 20, 'Unisex', 'An ode to the entire fig tree: green freshness and milky flavor.', 190.00, 'Diptyque Philosykos', 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop&q=60'),
(9, 40, 'Unisex', 'Escape the everyday along the windswept shore. Waves breaking white.', 155.00, 'Jo Malone Wood Sage & Sea Salt', 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=500&auto=format&fit=crop&q=60'),
(10, 12, 'Women', 'A colorful floral bouquet, like a millefiori of Rose, Peony, and Iris.', 145.00, 'Miss Dior', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500&auto=format&fit=crop&q=60'),
(11, 30, 'Women', 'The perfume of a strong, bold and free woman.', 150.00, 'YSL Libre', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500&auto=format&fit=crop&q=60'),
(12, 20, 'Women', 'A rich white floral scent that transports you to a diverse garden.', 135.00, 'Gucci Bloom', 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&auto=format&fit=crop&q=60'),
(13, 15, 'Women', 'A sweet floral fragrance featuring iris and warm vanilla.', 138.00, 'Lancome La Vie Est Belle', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500&auto=format&fit=crop&q=60'),
(14, 18, 'Women', 'Fresh and feminine, with notes of wild berries and jasmine.', 108.00, 'Marc Jacobs Daisy', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500&auto=format&fit=crop&q=60'),
(15, 50, 'Men', 'Exceptional scent celebrating strength, power and success.', 475.00, 'Creed Aventus', 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&auto=format&fit=crop&q=60'),
(16, 25, 'Men', 'A marine, aromatic fragrance with fresh bergamot and neroli.', 125.00, 'Acqua Di Gio', 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop&q=60'),
(17, 15, 'Men', 'Love, passion, beauty, and desire in a fresh oriental woody scent.', 102.00, 'Versace Eros', 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=500&auto=format&fit=crop&q=60'),
(18, 20, 'Men', 'A dark, powerful fragrance of cardamom, cedarwood, and coumarin.', 115.00, 'YSL La Nuit de L\'Homme', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500&auto=format&fit=crop&q=60');

-- ==========================================
-- 2. Database: users
-- ==========================================
USE users;

-- Clean existing data in order of foreign key dependencies
DELETE FROM users;
DELETE FROM users_details;
DELETE FROM user_role;

-- Insert roles
INSERT INTO user_role (id, role_name) VALUES
(1, 'ROLE_USER'),
(2, 'ROLE_ADMIN');

-- Insert user details
INSERT INTO users_details (id, country, email, first_name, last_name, locality, phone_number, street, street_number, zip_code) VALUES
(1, 'USA', 'john.doe@example.com', 'John', 'Doe', 'New York', '1234567890', 'Main St', '123', '10000'),
(2, 'USA', 'jane.smith@example.com', 'Jane', 'Smith', 'Los Angeles', '0987654321', 'Broadway', '456', '20000');

-- Insert users
INSERT INTO users (id, active, user_name, user_password, role_id, user_details_id) VALUES
(1, 1, 'johndoe', '$2b$12$kzWpygiCGSZ1y1Eq.AUyH.b/qi7OCyVBt.GKmUZwNobM5hxTKw9e2', 1, 1),
(2, 1, 'janesmith', '$2b$12$qsyEMwh9qqooIw/31L1hWe8Gl4svoyVmIgDsTAW4G5Sg4qjGdTpiy', 1, 2),
(3, 1, 'admin', '$2b$12$h/1HXNaUwT9GCfiZayVIVOodLDS0QYmOJGVcw9VIYGIw3wH9f1gX2', 2, NULL);

-- ==========================================
-- 3. Database: product_recommendations
-- ==========================================
USE product_recommendations;

-- Clean existing data
DELETE FROM recommendation;
DELETE FROM products;
DELETE FROM users;

-- Insert products
INSERT INTO products (id, product_name) VALUES
(1, 'Le Labo Santal 33'),
(2, 'Chanel No. 5'),
(3, 'Dior Sauvage'),
(4, 'Byredo Gypsy Water'),
(5, 'Bleu de Chanel'),
(6, 'Baccarat Rouge 540'),
(7, 'Tom Ford Oud Wood'),
(8, 'Diptyque Philosykos'),
(9, 'Jo Malone Wood Sage & Sea Salt'),
(10, 'Miss Dior'),
(11, 'YSL Libre'),
(12, 'Gucci Bloom'),
(13, 'Lancome La Vie Est Belle'),
(14, 'Marc Jacobs Daisy'),
(15, 'Creed Aventus'),
(16, 'Acqua Di Gio'),
(17, 'Versace Eros'),
(18, 'YSL La Nuit de L\'Homme');

-- Insert users
INSERT INTO users (id, user_name) VALUES
(1, 'johndoe'),
(2, 'janesmith');

-- Insert recommendations
INSERT INTO recommendation (id, rating, product_id, user_id) VALUES
(1, 5, 1, 1),
(2, 4, 2, 1),
(3, 5, 3, 2),
(4, 5, 6, 1),
(5, 4, 7, 2),
(6, 5, 11, 1),
(7, 4, 16, 2);

-- ==========================================
-- 4. Database: orders
-- ==========================================
USE orders;

-- Clean existing data
DELETE FROM coupons;
DELETE FROM cart;
DELETE FROM items;
DELETE FROM orders;
DELETE FROM products;
DELETE FROM users;

-- Insert coupons
INSERT INTO coupons (id, code, discount_percent, expiration_date, max_uses, used_count, active) VALUES
(1, 'PERFUME10', 10.0, '2030-12-31', 9999, 0, 1),
(2, 'SUMMER20', 20.0, '2030-12-31', 100, 0, 1),
(3, 'VIP50', 50.0, '2030-12-31', 10, 0, 1);

-- Insert products
INSERT INTO products (product_id, price, product_name) VALUES
(1, 310.00, 'Le Labo Santal 33'),
(2, 165.00, 'Chanel No. 5'),
(3, 145.00, 'Dior Sauvage'),
(4, 200.00, 'Byredo Gypsy Water'),
(5, 150.00, 'Bleu de Chanel'),
(6, 325.00, 'Baccarat Rouge 540'),
(7, 285.00, 'Tom Ford Oud Wood'),
(8, 190.00, 'Diptyque Philosykos'),
(9, 155.00, 'Jo Malone Wood Sage & Sea Salt'),
(10, 145.00, 'Miss Dior'),
(11, 150.00, 'YSL Libre'),
(12, 135.00, 'Gucci Bloom'),
(13, 138.00, 'Lancome La Vie Est Belle'),
(14, 108.00, 'Marc Jacobs Daisy'),
(15, 475.00, 'Creed Aventus'),
(16, 125.00, 'Acqua Di Gio'),
(17, 102.00, 'Versace Eros'),
(18, 115.00, 'YSL La Nuit de L\'Homme');

-- Insert users
INSERT INTO users (id, user_name) VALUES
(1, 'johndoe'),
(2, 'janesmith');

-- Insert orders
INSERT INTO orders (id, ordered_date, status, total, user_id) VALUES
(1, '2026-06-08', 'PAYMENT_EXPECTED', 455.00, 1);

-- Insert items
INSERT INTO items (id, quantity, subtotal, product_id) VALUES
(1, 1, 310.00, 1),
(2, 1, 145.00, 3);

-- Map items to orders (cart table)
INSERT INTO cart (order_id, item_id) VALUES
(1, 1),
(1, 2);
