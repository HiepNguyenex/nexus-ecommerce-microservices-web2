-- Seed data for E-Commerce Microservices
-- Target Databases: product_catalog, users, product_recommendations, orders

-- ==========================================
-- 1. Database: product_catalog
-- ==========================================
USE product_catalog;

-- Clean existing data
DELETE FROM products;

-- Insert products (note the column name 'discription' as defined in Hibernate entity)
INSERT INTO products (id, availability, category, discription, price, product_name) VALUES
(1, 10, 'Electronics', 'Samsung Galaxy S21 5G 128GB', 799.99, 'Smartphone Galaxy S21'),
(2, 5, 'Electronics', 'Apple MacBook Pro 13-inch M1 8GB 256GB', 1299.99, 'MacBook Pro 13'),
(3, 15, 'Clothing', 'Genuine black leather jacket', 120.00, 'Leather Jacket'),
(4, 20, 'Clothing', 'Comfortable running sports shoes', 85.50, 'Running Shoes'),
(5, 30, 'Books', 'Introduction to Java Programming 11th Edition', 45.00, 'Java Programming Book');

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
(2, 1, 'janesmith', '$2b$12$qsyEMwh9qqooIw/31L1hWe8Gl4svoyVmIgDsTAW4G5Sg4qjGdTpiy', 2, 2);

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
(1, 'Smartphone Galaxy S21'),
(2, 'MacBook Pro 13'),
(3, 'Leather Jacket');

-- Insert users
INSERT INTO users (id, user_name) VALUES
(1, 'johndoe'),
(2, 'janesmith');

-- Insert recommendations
INSERT INTO recommendation (id, rating, product_id, user_id) VALUES
(1, 5, 1, 1),
(2, 4, 2, 1),
(3, 5, 3, 2);

-- ==========================================
-- 4. Database: orders
-- ==========================================
USE orders;

-- Clean existing data
DELETE FROM cart;
DELETE FROM items;
DELETE FROM orders;
DELETE FROM products;
DELETE FROM users;

-- Insert products
INSERT INTO products (product_id, price, product_name) VALUES
(1, 799.99, 'Smartphone Galaxy S21'),
(2, 1299.99, 'MacBook Pro 13'),
(3, 120.00, 'Leather Jacket');

-- Insert users
INSERT INTO users (id, user_name) VALUES
(1, 'johndoe'),
(2, 'janesmith');

-- Insert orders
INSERT INTO orders (id, ordered_date, status, total, user_id) VALUES
(1, '2026-06-08', 'PAYMENT_EXPECTED', 919.99, 1);

-- Insert items
INSERT INTO items (id, quantity, subtotal, product_id) VALUES
(1, 1, 799.99, 1),
(2, 1, 120.00, 3);

-- Map items to orders (cart table)
INSERT INTO cart (order_id, item_id) VALUES
(1, 1),
(1, 2);
