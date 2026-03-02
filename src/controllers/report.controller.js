const { pgPool } = require('../config/db');

const getSupplierReport = async (req, res) => {
    try {
        const query = `
            SELECT s.name AS supplier, SUM(ti.quantity) AS total_items, SUM(ti.quantity * ti.unit_price) AS total_value
            FROM suppliers s
            JOIN products p ON s.id = p.supplier_id
            JOIN transaction_items ti ON p.sku = ti.product_sku
            GROUP BY s.name ORDER BY total_items DESC;
        `;
        const result = await pgPool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getCustomerHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT t.transaction_date, p.name AS product, ti.quantity, (ti.quantity * ti.unit_price) AS total_spent
            FROM transactions t
            JOIN transaction_items ti ON t.id = ti.transaction_id
            JOIN products p ON ti.product_sku = p.sku
            WHERE t.customer_id = $1 ORDER BY t.transaction_date DESC;
        `;
        const result = await pgPool.query(query, [id]);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getTopProducts = async (req, res) => {
    try {
        const { category } = req.query;
        const query = `SELECT * FROM get_top_products_by_category($1)`;
        const result = await pgPool.query(query, [category]);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getSupplierReport, getCustomerHistory, getTopProducts };