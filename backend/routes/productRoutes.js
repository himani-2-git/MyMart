const express = require('express');
const router = express.Router();
const { getProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');
const { validateProduct } = require('../middleware/validate');

router.route('/')
    .get(protect, getProducts)
    .post(protect, admin, validateProduct, createProduct);

router.route('/:id')
    .put(protect, admin, validateProduct, updateProduct)
    .delete(protect, admin, deleteProduct);

module.exports = router;
