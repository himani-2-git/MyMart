const express = require('express');
const router = express.Router();
const { addExpense, getExpenses, updateExpense, deleteExpense } = require('../controllers/expenseController');
const { protect, admin } = require('../middleware/authMiddleware');
const { validateExpense } = require('../middleware/validate');

router.route('/')
    .post(protect, admin, validateExpense, addExpense)
    .get(protect, admin, getExpenses);

router.route('/:id')
    .put(protect, admin, validateExpense, updateExpense)
    .delete(protect, admin, deleteExpense);

module.exports = router;
