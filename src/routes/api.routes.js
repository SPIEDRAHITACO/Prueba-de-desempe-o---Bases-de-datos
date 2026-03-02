const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const { migrateData } = require('../controllers/migration.controller');
const { getProducts, createProduct, deleteProduct } = require('../controllers/product.controller');
const { getSupplierReport, getCustomerHistory, getTopProducts } = require('../controllers/report.controller');

const router = express.Router();

router.post('/migrate', upload.single('file'), migrateData);

router.get('/products', getProducts);
router.post('/products', createProduct);
router.delete('/products/:sku', deleteProduct);

router.get('/reports/suppliers', getSupplierReport);
router.get('/reports/customers/:id', getCustomerHistory);
router.get('/reports/top-products', getTopProducts);

module.exports = router;
