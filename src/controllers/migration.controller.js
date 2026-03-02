const fs = require('fs');
const csv = require('csv-parser');
const { pgPool } = require('../config/db');

const migrateData = async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No CSV file uploaded' });

    const results = [];
    const filePath = req.file.path;

    // Read CSV handling headers exactly as in megastoreglobal.csv
    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            const client = await pgPool.connect();
            try {
                await client.query('BEGIN'); // Start transaction

                for (let row of results) {
                    const txId = row['transaction_id'];
                    const date = row['date'];
                    const cName = row['customer_name'];
                    const cEmail = row['customer_email'];
                    const rawAddress = row['customer_address'];
                    const cPhone = row['customer_phone'];
                    const pCategory = row['product_category'];
                    const pSku = row['product_sku'];
                    const pName = row['product_name'];
                    const unitPrice = parseFloat(row['unit_price']);
                    const qty = parseInt(row['quantity']);
                    const sName = row['supplier_name'];
                    const sEmail = row['supplier_email'];

                    // 1. Separate City from Address
                    const addressParts = rawAddress.split(' ');
                    const cityName = addressParts.length > 1 ? addressParts.pop() : 'Unknown';
                    const address = addressParts.join(' ');

                    // 2. Insert City (Idempotent)
                    let cityRes = await client.query('SELECT id FROM cities WHERE name = $1', [cityName]);
                    let cityId;
                    if (cityRes.rows.length === 0) {
                        const insertCity = await client.query('INSERT INTO cities (name) VALUES ($1) RETURNING id', [cityName]);
                        cityId = insertCity.rows[0].id;
                    } else {
                        cityId = cityRes.rows[0].id;
                    }

                    // 3. Insert Customer (Idempotent)
                    const customerId = cEmail.split('@')[0];
                    await client.query(
                        `INSERT INTO customers (id, name, email, phone, address, city_id) 
                         VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (email) DO NOTHING`,
                        [customerId, cName, cEmail, cPhone, address, cityId]
                    );

                    // 4. Insert Supplier (Idempotent)
                    let supRes = await client.query('SELECT id FROM suppliers WHERE email = $1', [sEmail]);
                    let supplierId;
                    if (supRes.rows.length === 0) {
                        const insertSup = await client.query('INSERT INTO suppliers (name, email) VALUES ($1, $2) RETURNING id', [sName, sEmail]);
                        supplierId = insertSup.rows[0].id;
                    } else {
                        supplierId = supRes.rows[0].id;
                    }

                    // 5. Insert Product (Idempotent)
                    await client.query(
                        `INSERT INTO products (sku, name, category, unit_price, supplier_id) 
                         VALUES ($1, $2, $3, $4, $5) ON CONFLICT (sku) DO NOTHING`,
                        [pSku, pName, pCategory, unitPrice, supplierId]
                    );

                    // 6. Insert Transaction (Idempotent)
                    await client.query(
                        `INSERT INTO transactions (id, transaction_date, customer_id) 
                         VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING`,
                        [txId, date, customerId]
                    );

                    // 7. Insert Transaction Item
                    await client.query(
                        `INSERT INTO transaction_items (transaction_id, product_sku, quantity, unit_price) 
                         VALUES ($1, $2, $3, $4)`,
                        [txId, pSku, qty, unitPrice]
                    );
                }

                await client.query('COMMIT');
                res.status(200).json({ message: 'Migration completed. City separated. No duplicates generated.' });

            } catch (err) {
                await client.query('ROLLBACK');
                res.status(500).json({ error: err.message });
            } finally {
                client.release();
                if(fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }
        });
};

module.exports = { migrateData };