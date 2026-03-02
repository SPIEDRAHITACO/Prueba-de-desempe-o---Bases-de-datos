-- DDL for PostgreSQL (3NF Normalized - 6 Tables)

CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city_id INT REFERENCES cities(id)
);

CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
    sku VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    supplier_id INT REFERENCES suppliers(id)
);

CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(50) PRIMARY KEY,
    transaction_date DATE NOT NULL,
    customer_id VARCHAR(50) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS transaction_items (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(50) REFERENCES transactions(id),
    product_sku VARCHAR(50) REFERENCES products(sku),
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL
);

-- Stored Procedure for Business Intelligence
CREATE OR REPLACE FUNCTION get_top_products_by_category(cat_name VARCHAR)
RETURNS TABLE (product_name VARCHAR, total_revenue DECIMAL) AS $$
BEGIN
    RETURN QUERY 
    SELECT p.name::VARCHAR, SUM(ti.quantity * ti.unit_price)::DECIMAL AS total_revenue
    FROM transaction_items ti
    JOIN products p ON ti.product_sku = p.sku
    WHERE p.category = cat_name
    GROUP BY p.name
    ORDER BY total_revenue DESC;
END;
$$ LANGUAGE plpgsql;