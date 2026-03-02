const { pgPool } = require('../config/db');
const AuditLog = require('../models/audit.model');

const createProduct = async (req, res) => {
    const { sku, name, category, unit_price, supplier_id } = req.body;
    try {
        const query = 'INSERT INTO products (sku, name, category, unit_price, supplier_id) VALUES ($1, $2, $3, $4, $5) RETURNING *';
        const result = await pgPool.query(query, [sku, name, category, unit_price, supplier_id]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getProducts = async (req, res) => {
    try {
        const result = await pgPool.query('SELECT * FROM products');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteProduct = async (req, res) => {
    const { sku } = req.params;
    try {
        const product = await pgPool.query('SELECT * FROM products WHERE sku = $1', [sku]);
        if (product.rows.length === 0) return res.status(404).json({ message: 'Product not found' });

        // SQL Delete
        await pgPool.query('DELETE FROM products WHERE sku = $1', [sku]);

        // NoSQL Audit Save
        const log = new AuditLog({
            entity: 'Product',
            deletedId: sku,
            deletedData: product.rows[0]
        });
        await log.save();

        res.status(200).json({ message: 'Product deleted from SQL and logged in NoSQL Audit' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createProduct, getProducts, deleteProduct };