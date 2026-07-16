-- Seed data for E-Commerce Microservices
-- Target Databases: product_catalog, users, product_recommendations, orders

-- ==========================================
-- 1. Database: product_catalog
-- ==========================================
USE product_catalog;

-- Clean existing data
DELETE FROM product_variants;
DELETE FROM products;

-- Insert products (note the column name 'discription' as defined in Hibernate entity)
INSERT INTO products (id, availability, category, discription, price, product_name, image_url, top_notes, middle_notes, base_notes, olfactory_family, concentration, longevity, sillage) VALUES
(1, 10, 'Unisex', 'Woody aromatic fragrance with cardamom, iris, and violet.', 310.00, 'Le Labo Santal 33', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500&auto=format&fit=crop&q=60', 'Cardamom, Violet accord', 'Iris, Papyrus, Ambrox', 'Cedarwood, Leather, Sandalwood', 'Woody', 'EDP', '8-10 hours', 'Moderate to Strong'),
(2, 5, 'Women', 'The legendary aldehyde floral bouquet in its classic bottle.', 165.00, 'Chanel No. 5', 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=500&auto=format&fit=crop&q=60', 'Aldehydes, Ylang-Ylang, Neroli', 'Jasmine, May Rose', 'Sandalwood, Vanilla, Vetiver', 'Floral', 'EDP', '6-8 hours', 'Strong'),
(3, 15, 'Men', 'A radically fresh composition, raw and noble all at once.', 145.00, 'Dior Sauvage', 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=500&auto=format&fit=crop&q=60', 'Calabrian Bergamot, Pepper', 'Sichuan Pepper, Lavender, Patchouli', 'Ambroxan, Cedar', 'Fresh Citrus', 'EDT', '8-12 hours', 'Strong'),
(4, 20, 'Unisex', 'A glamorization of the Romany lifestyle, earthy and woody.', 200.00, 'Byredo Gypsy Water', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500&auto=format&fit=crop&q=60', 'Juniper, Lemon, Bergamot', 'Pine Needles, Incense, Orris Root', 'Sandalwood, Vanilla, Amber', 'Woody', 'EDP', '4-6 hours', 'Intimate'),
(5, 30, 'Men', 'An olfactory tribute to masculine freedom, woody aromatic.', 150.00, 'Bleu de Chanel', 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&auto=format&fit=crop&q=60', 'Grapefruit, Lemon, Mint', 'Ginger, Jasmine, Nutmeg', 'Sandalwood, Incense, Cedar', 'Woody Citrus', 'EDP', '6-8 hours', 'Moderate'),
(6, 15, 'Unisex', 'Luminous and sophisticated, amber, floral and woody breeze.', 325.00, 'Baccarat Rouge 540', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500&auto=format&fit=crop&q=60', 'Saffron, Jasmine', 'Amberwood, Ambergris', 'Fir Resin, Cedar', 'Amber Woody', 'EDP', '10-12 hours', 'Strong'),
(7, 25, 'Unisex', 'One of the most rare, precious, and expensive ingredients.', 285.00, 'Tom Ford Oud Wood', 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=500&auto=format&fit=crop&q=60', 'Rosewood, Cardamom, Chinese Pepper', 'Oud, Sandalwood, Vetiver', 'Tonka Bean, Vanilla, Amber', 'Woody Oriental', 'EDP', '6-8 hours', 'Moderate'),
(8, 20, 'Unisex', 'An ode to the entire fig tree: green freshness and milky flavor.', 190.00, 'Diptyque Philosykos', 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop&q=60', 'Fig Leaf, Fig', 'Green Notes, Coconut', 'Fig Tree, Cedar, Woody Notes', 'Fruity Green', 'EDT', '4-6 hours', 'Moderate'),
(9, 40, 'Unisex', 'Escape the everyday along the windswept shore. Waves breaking white.', 155.00, 'Jo Malone Wood Sage & Sea Salt', 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=500&auto=format&fit=crop&q=60', 'Ambrette Seeds', 'Sea Salt', 'Sage', 'Fresh Aquatic', 'Cologne', '3-4 hours', 'Intimate'),
(10, 12, 'Women', 'A colorful floral bouquet, like a millefiori of Rose, Peony, and Iris.', 145.00, 'Miss Dior', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500&auto=format&fit=crop&q=60', 'Iris, Peony, Lily-of-the-Valley', 'Rose, Peach, Apricot', 'Vanilla, Musk, Tonka Bean', 'Floral', 'EDP', '6-8 hours', 'Moderate'),
(11, 30, 'Women', 'The perfume of a strong, bold and free woman.', 150.00, 'YSL Libre', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500&auto=format&fit=crop&q=60', 'Lavender, Mandarin Orange, Black Currant', 'Lavender, Orange Blossom, Jasmine', 'Madagascar Vanilla, Musk, Ambergris', 'Floral Amber', 'EDP', '8-10 hours', 'Strong'),
(12, 20, 'Women', 'A rich white floral scent that transports you to a diverse garden.', 135.00, 'Gucci Bloom', 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&auto=format&fit=crop&q=60', 'Jasmine', 'Tuberose', 'Ranger Creeper', 'White Floral', 'EDP', '6-8 hours', 'Moderate'),
(13, 15, 'Women', 'A sweet floral fragrance featuring iris and warm vanilla.', 138.00, 'Lancome La Vie Est Belle', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500&auto=format&fit=crop&q=60', 'Black Currant, Pear', 'Iris, Jasmine, Orange Blossom', 'Praline, Vanilla, Patchouli, Tonka Bean', 'Gourmand Floral', 'EDP', '8-12 hours', 'Strong'),
(14, 18, 'Women', 'Fresh and feminine, with notes of wild berries and jasmine.', 108.00, 'Marc Jacobs Daisy', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500&auto=format&fit=crop&q=60', 'Violet Leaf, Grapefruit, Strawberry', 'Gardenia, Violet, Jasmine', 'Musk, White Woods, Vanilla', 'Fruity Floral', 'EDT', '4-6 hours', 'Intimate'),
(15, 50, 'Men', 'Exceptional scent celebrating strength, power and success.', 475.00, 'Creed Aventus', 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&auto=format&fit=crop&q=60', 'Pineapple, Bergamot, Blackcurrant', 'Birch, Patchouli, Jasmine, Rose', 'Musk, Oakmoss, Ambergris, Vanilla', 'Fruity Chypre', 'EDP', '8-12 hours', 'Strong'),
(16, 25, 'Men', 'A marine, aromatic fragrance with fresh bergamot and neroli.', 125.00, 'Acqua Di Gio', 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop&q=60', 'Lime, Lemon, Jasmine, Bergamot', 'Sea Notes, Peach, Freesia', 'White Musk, Cedar, Oakmoss', 'Fresh Marine', 'EDT', '5-7 hours', 'Moderate'),
(17, 15, 'Men', 'Love, passion, beauty, and desire in a fresh oriental woody scent.', 102.00, 'Versace Eros', 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=500&auto=format&fit=crop&q=60', 'Mint, Green Apple, Lemon', 'Tonka Bean, Ambroxan, Geranium', 'Madagascar Vanilla, Virginian Cedar', 'Aromatic Fougere', 'EDT', '8-10 hours', 'Strong'),
(18, 20, 'Men', 'A dark, powerful fragrance of cardamom, cedarwood, and coumarin.', 115.00, 'YSL La Nuit de L\'Homme', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500&auto=format&fit=crop&q=60', 'Cardamom', 'Lavender, Virginia Cedar, Bergamot', 'Vetiver, Caraway', 'Spicy Woody', 'EDT', '6-8 hours', 'Moderate'),
(19, 20, 'Women', 'A pink floral dream with rose, peony, and a hint of spun sugar.', 112.00, 'Viktor & Rolf Flowerbomb', 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=500&auto=format&fit=crop&q=60', 'Tea, Bergamot, Osmanthus', 'Rose, Freesia, Orchid, Peony', 'Patchouli, Musk, Vanilla', 'Floral Oriental', 'EDP', '8-10 hours', 'Strong'),
(20, 35, 'Men', 'A bold oriental fougere that balances lavender and vanilla perfectly.', 95.00, 'Paco Rabanne 1 Million', 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&auto=format&fit=crop&q=60', 'Blood Mandarin, Grapefruit, Mint', 'Rose, Cinnamon, Spices', 'Leather, Amber, Patchouli, Blond Wood', 'Oriental Fougere', 'EDT', '6-8 hours', 'Strong'),
(21, 18, 'Unisex', 'An intimate skin scent with warm musk and soft florals lingering like a memory.', 178.00, 'Maison Margiela Replica Lazy Sunday Morning', 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=500&auto=format&fit=crop&q=60', 'Aldehydes, Bergamot', 'Rose, Peony, Iris', 'Musk, White Wood, Sandalwood', 'Soft Floral', 'EDP', '5-7 hours', 'Intimate'),
(22, 12, 'Men', 'A masterclass in minimalism. Clean, precise, and endlessly versatile.', 95.00, 'Armani Acqua di Gio Profumo', 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop&q=60', 'Bergamot, Sea Notes', 'Geranium, Sage, Rosemary', 'Incense, Patchouli, Vetiver', 'Aromatic Aquatic', 'Parfum', '10-12 hours', 'Moderate'),
(23, 22, 'Women', 'Joy, sensuality, and freedom: a modern femme floral chypre.', 220.00, 'Chanel Chance Eau Tendre', 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=500&auto=format&fit=crop&q=60', 'Grapefruit, Quince, Citrus', 'Jasmine, Hyacinth', 'Iris, Musk, Amber', 'Fresh Floral Chypre', 'EDP', '6-8 hours', 'Moderate'),
(24, 30, 'Unisex', 'An unexpected tobacco flower accord, honeyed and carnal.', 260.00, 'Tom Ford Tobacco Vanille', 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=500&auto=format&fit=crop&q=60', 'Tobacco Leaf, Spices', 'Tobacco Blossom, Jasmine, Dried Fruits', 'Vanilla, Cacao, Tonka Bean, Woody Notes', 'Oriental', 'EDP', '10-14 hours', 'Very Strong'),
(25, 14, 'Men', 'Vetiver stripped to its most primal, green, smoky, and earthy state.', 245.00, 'Guerlain Vetiver', 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=500&auto=format&fit=crop&q=60', 'Lemon, Bergamot, Coriander', 'Tobacco, Geranium, Cedar', 'Vetiver, Oakmoss, Amber', 'Woody Chypre', 'EDT', '6-8 hours', 'Moderate'),
(26, 25, 'Women', 'Inspired by the freedom of flying—clean, bright, and effervescent.', 135.00, 'Chloe Eau de Parfum', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500&auto=format&fit=crop&q=60', 'Pink Peony, Sweet Pea, Lychee', 'Magnolia, Lily of the Valley', 'Cedar, Amber, Musk', 'Floral Musky', 'EDP', '6-8 hours', 'Moderate'),
(27, 20, 'Men', 'An opulent amber tobacco, born of night in the far East.', 185.00, 'Bulgari Man in Black', 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=500&auto=format&fit=crop&q=60', 'Rum, Plum', 'Tobacco Absolute, Tuberose', 'Benzoin, Leather, Guaiac Wood, Lava Rock', 'Amber Oriental', 'EDP', '8-10 hours', 'Strong'),
(28, 30, 'Unisex', 'A revolutionary olfactory formula, clean and mineral, like a second skin.', 420.00, 'Frederic Malle Portrait of a Lady', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500&auto=format&fit=crop&q=60', 'Blackcurrant Berry, Raspberry', 'Turkish Rose, Patchouli, Incense', 'Sandalwood, Musk, Benzoin, Cinnamon', 'Floral Chypre', 'EDP', '10-12 hours', 'Very Strong');

-- Insert product variants
INSERT INTO product_variants (id, size, price, stock, product_id) VALUES
(1, '2ml', 15.00, 100, 1),
(2, '10ml', 45.00, 50, 1),
(3, '50ml', 180.00, 20, 1),
(4, '100ml', 310.00, 10, 1),
(5, '2ml', 10.00, 100, 2),
(6, '10ml', 25.00, 50, 2),
(7, '50ml', 100.00, 20, 2),
(8, '100ml', 165.00, 5, 2),
(9, '2ml', 8.00, 150, 3),
(10, '10ml', 22.00, 80, 3),
(11, '50ml', 90.00, 30, 3),
(12, '100ml', 145.00, 15, 3),
(13, '2ml', 12.00, 100, 4),
(14, '10ml', 32.00, 50, 4),
(15, '100ml', 200.00, 20, 4),
(16, '2ml', 9.00, 150, 5),
(17, '10ml', 24.00, 90, 5),
(18, '100ml', 150.00, 30, 5),
(19, '2ml', 18.00, 80, 6),
(20, '10ml', 55.00, 40, 6),
(21, '100ml', 325.00, 15, 6),
(22, '2ml', 16.00, 100, 7),
(23, '10ml', 48.00, 50, 7),
(24, '100ml', 285.00, 25, 7),
(25, '2ml', 11.00, 120, 8),
(26, '10ml', 30.00, 60, 8),
(27, '100ml', 190.00, 20, 8),
(28, '2ml', 8.00, 150, 9),
(29, '10ml', 23.00, 80, 9),
(30, '100ml', 155.00, 40, 9),
(31, '2ml', 8.00, 100, 10),
(32, '10ml', 22.00, 50, 10),
(33, '100ml', 145.00, 12, 10),
(34, '2ml', 9.00, 120, 11),
(35, '10ml', 24.00, 60, 11),
(36, '100ml', 150.00, 30, 11),
(37, '2ml', 8.00, 100, 12),
(38, '10ml', 20.00, 50, 12),
(39, '100ml', 135.00, 20, 12),
(40, '2ml', 8.00, 100, 13),
(41, '10ml', 21.00, 50, 13),
(42, '100ml', 138.00, 15, 13),
(43, '2ml', 6.00, 100, 14),
(44, '10ml', 16.00, 50, 14),
(45, '100ml', 108.00, 18, 14),
(46, '2ml', 22.00, 100, 15),
(47, '10ml', 65.00, 50, 15),
(48, '100ml', 475.00, 50, 15),
(49, '2ml', 7.00, 150, 16),
(50, '10ml', 18.00, 80, 16),
(51, '100ml', 125.00, 40, 16),
(52, '2ml', 6.00, 200, 17),
(53, '10ml', 15.00, 100, 17),
(54, '100ml', 102.00, 15, 17),
(55, '2ml', 7.00, 120, 18),
(56, '10ml', 17.00, 60, 18),
(57, '100ml', 115.00, 20, 18),
-- Product 19: Viktor & Rolf Flowerbomb
(58, '2ml', 7.00, 150, 19),
(59, '10ml', 17.00, 80, 19),
(60, '50ml', 75.00, 30, 19),
(61, '100ml', 112.00, 20, 19),
-- Product 20: Paco Rabanne 1 Million
(62, '2ml', 6.00, 200, 20),
(63, '10ml', 14.00, 100, 20),
(64, '50ml', 65.00, 50, 20),
(65, '100ml', 95.00, 35, 20),
-- Product 21: Maison Margiela Replica Lazy Sunday Morning
(66, '2ml', 10.00, 100, 21),
(67, '10ml', 28.00, 50, 21),
(68, '50ml', 110.00, 20, 21),
(69, '100ml', 178.00, 18, 21),
-- Product 22: Armani Acqua di Gio Profumo
(70, '2ml', 6.00, 120, 22),
(71, '10ml', 16.00, 60, 22),
(72, '50ml', 70.00, 20, 22),
(73, '100ml', 95.00, 12, 22),
-- Product 23: Chanel Chance Eau Tendre
(74, '2ml', 12.00, 100, 23),
(75, '10ml', 35.00, 60, 23),
(76, '50ml', 140.00, 25, 23),
(77, '100ml', 220.00, 22, 23),
-- Product 24: Tom Ford Tobacco Vanille
(78, '2ml', 14.00, 80, 24),
(79, '10ml', 42.00, 40, 24),
(80, '50ml', 165.00, 15, 24),
(81, '100ml', 260.00, 30, 24),
-- Product 25: Guerlain Vetiver
(82, '2ml', 13.00, 80, 25),
(83, '10ml', 38.00, 40, 25),
(84, '50ml', 150.00, 18, 25),
(85, '100ml', 245.00, 14, 25),
-- Product 26: Chloe Eau de Parfum
(86, '2ml', 8.00, 130, 26),
(87, '10ml', 20.00, 70, 26),
(88, '50ml', 90.00, 30, 26),
(89, '100ml', 135.00, 25, 26),
-- Product 27: Bulgari Man in Black
(90, '2ml', 10.00, 100, 27),
(91, '10ml', 28.00, 60, 27),
(92, '50ml', 115.00, 25, 27),
(93, '100ml', 185.00, 20, 27),
-- Product 28: Frederic Malle Portrait of a Lady
(94, '2ml', 20.00, 60, 28),
(95, '10ml', 60.00, 30, 28),
(96, '50ml', 265.00, 12, 28),
(97, '100ml', 420.00, 30, 28);

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
(18, 'YSL La Nuit de L\'Homme'),
(19, 'Viktor & Rolf Flowerbomb'),
(20, 'Paco Rabanne 1 Million'),
(21, 'Maison Margiela Replica Lazy Sunday Morning'),
(22, 'Armani Acqua di Gio Profumo'),
(23, 'Chanel Chance Eau Tendre'),
(24, 'Tom Ford Tobacco Vanille'),
(25, 'Guerlain Vetiver'),
(26, 'Chloe Eau de Parfum'),
(27, 'Bulgari Man in Black'),
(28, 'Frederic Malle Portrait of a Lady');

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
(18, 115.00, 'YSL La Nuit de L\'Homme'),
(19, 112.00, 'Viktor & Rolf Flowerbomb'),
(20, 95.00, 'Paco Rabanne 1 Million'),
(21, 178.00, 'Maison Margiela Replica Lazy Sunday Morning'),
(22, 95.00, 'Armani Acqua di Gio Profumo'),
(23, 220.00, 'Chanel Chance Eau Tendre'),
(24, 260.00, 'Tom Ford Tobacco Vanille'),
(25, 245.00, 'Guerlain Vetiver'),
(26, 135.00, 'Chloe Eau de Parfum'),
(27, 185.00, 'Bulgari Man in Black'),
(28, 420.00, 'Frederic Malle Portrait of a Lady');

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
