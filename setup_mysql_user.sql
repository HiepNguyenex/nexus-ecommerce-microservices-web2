-- ====================================================================
-- Setup dedicated MySQL user for e-commerce microservices (H2 - MySQL)
-- Run as: mysql -u root < setup_mysql_user.sql
-- ====================================================================

-- Drop and recreate app user (idempotent)
DROP USER IF EXISTS 'ecom_app'@'localhost';

-- Password: EcomApp_StrongP@ss_2026
-- Change it before running in production!
CREATE USER 'ecom_app'@'localhost' IDENTIFIED BY 'EcomApp_StrongP@ss_2026';

-- Grant privileges only on the 4 databases we need
GRANT ALL PRIVILEGES ON users.* TO 'ecom_app'@'localhost';
GRANT ALL PRIVILEGES ON orders.* TO 'ecom_app'@'localhost';
GRANT ALL PRIVILEGES ON product_catalog.* TO 'ecom_app'@'localhost';
GRANT ALL PRIVILEGES ON product_recommendations.* TO 'ecom_app'@'localhost';

FLUSH PRIVILEGES;

-- Verify
SELECT user, host FROM mysql.user WHERE user = 'ecom_app';
