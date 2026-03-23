const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    expenseType: { type: String, required: true },
    amount: { type: Number, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for date-based queries
expenseSchema.index({ date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);
