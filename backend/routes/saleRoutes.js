const express = require('express');
const router = express.Router();
const { addSaleItems, getSales, getSaleById, getCustomerByPhone } = require('../controllers/saleController');
const { protect, admin } = require('../middleware/authMiddleware');
const { validateSale } = require('../middleware/validate');

router.route('/')
    .post(protect, admin, validateSale, addSaleItems)
    .get(protect, admin, getSales);

router.route('/customer/:phone')
    .get(protect, admin, getCustomerByPhone);

router.route('/:id')
    .get(protect, admin, getSaleById);

module.exports = router;
