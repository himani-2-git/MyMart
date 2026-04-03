const Expense = require('../models/Expense');
const { logActivity } = require('./activityController');

// @desc    Add new expense
// @route   POST /api/expenses
// @access  Private/Admin
const addExpense = async (req, res, next) => {
    try {
        const expense = new Expense(req.body);
        const createdExpense = await expense.save();
        await logActivity(req.user._id, 'expense_added', 'expense', createdExpense._id, `Added expense: ${createdExpense.amount} for ${createdExpense.expenseType}`);
        res.status(201).json(createdExpense);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private/Admin
const getExpenses = async (req, res, next) => {
    try {
        const expenses = await Expense.find({}).sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        next(error);
    }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private/Admin
const updateExpense = async (req, res, next) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ success: false, message: 'Expense not found' });
        }

        Object.assign(expense, req.body);
        const updatedExpense = await expense.save();
        await logActivity(req.user._id, 'expense_updated', 'expense', updatedExpense._id, `Updated expense: ${updatedExpense.amount}`);
        res.json(updatedExpense);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private/Admin
const deleteExpense = async (req, res, next) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ success: false, message: 'Expense not found' });
        }

        await expense.deleteOne();
        await logActivity(req.user._id, 'expense_deleted', 'expense', expense._id, `Deleted expense: ${expense.amount}`);
        res.json({ success: true, message: 'Expense removed' });
    } catch (error) {
        next(error);
    }
};

module.exports = { addExpense, getExpenses, updateExpense, deleteExpense };
