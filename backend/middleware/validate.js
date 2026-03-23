const { body, validationResult } = require('express-validator');

// Middleware to check validation results and return 400 on failure
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Invalid request data',
            errors: errors.array().map(e => ({
                field: e.path,
                message: e.msg
            }))
        });
    }
    next();
};

// ── Product validation rules ──
const validateProduct = [
    body('name')
        .trim()
        .notEmpty().withMessage('Product name is required')
        .isLength({ max: 100 }).withMessage('Product name must be under 100 characters'),
    body('category')
        .trim()
        .notEmpty().withMessage('Category is required'),
    body('costPrice')
        .notEmpty().withMessage('Cost price is required')
        .isFloat({ gt: 0 }).withMessage('Cost price must be greater than 0'),
    body('sellingPrice')
        .notEmpty().withMessage('Selling price is required')
        .isFloat({ gt: 0 }).withMessage('Selling price must be greater than 0'),
    body('quantity')
        .notEmpty().withMessage('Quantity is required')
        .isInt({ min: 0 }).withMessage('Quantity must be 0 or greater'),
    body('expiryDate')
        .optional({ values: 'falsy' })
        .isISO8601().withMessage('Expiry date must be a valid date'),
    body('supplierName')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 100 }).withMessage('Supplier name must be under 100 characters'),
    body('barcode')
        .optional({ values: 'falsy' })
        .trim(),
    handleValidation
];

// ── Expense validation rules ──
const validateExpense = [
    body('expenseType')
        .trim()
        .notEmpty().withMessage('Expense type is required')
        .isIn(['Rent', 'Electricity', 'Salary', 'Maintenance', 'Marketing', 'Other'])
        .withMessage('Invalid expense type'),
    body('amount')
        .notEmpty().withMessage('Amount is required')
        .isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
    body('description')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 500 }).withMessage('Description must be under 500 characters'),
    body('date')
        .optional({ values: 'falsy' })
        .isISO8601().withMessage('Date must be a valid date'),
    handleValidation
];

// ── Sale validation rules ──
const validateSale = [
    body('orderItems')
        .isArray({ min: 1 }).withMessage('Order must contain at least one item'),
    body('orderItems.*.name')
        .trim()
        .notEmpty().withMessage('Item name is required'),
    body('orderItems.*.qty')
        .isInt({ min: 1 }).withMessage('Item quantity must be at least 1'),
    body('orderItems.*.price')
        .isFloat({ gt: 0 }).withMessage('Item price must be greater than 0'),
    body('orderItems.*.product')
        .notEmpty().withMessage('Product ID is required'),
    body('paymentMethod')
        .optional()
        .isIn(['Cash', 'Card', 'UPI']).withMessage('Payment method must be Cash, Card, or UPI'),
    body('customerName')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 100 }).withMessage('Customer name must be under 100 characters'),
    body('customerPhone')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 20 }).withMessage('Customer phone must be under 20 characters'),
    handleValidation
];

// ── Auth validation rules ──
const validateLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email'),
    body('password')
        .notEmpty().withMessage('Password is required'),
    handleValidation
];

const validateRegister = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    handleValidation
];

const validatePasswordUpdate = [
    body('currentPassword')
        .notEmpty().withMessage('Current password is required'),
    body('newPassword')
        .notEmpty().withMessage('New password is required')
        .isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    handleValidation
];

const validateProfileUpdate = [
    body('name')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('storeDetails')
        .optional(),
    body('storeDetails.name').optional().trim(),
    body('storeDetails.address').optional().trim(),
    body('storeDetails.pin').optional().trim(),
    body('storeDetails.state').optional().trim(),
    body('storeDetails.country').optional().trim(),
    body('storeDetails.ownerName').optional().trim(),
    body('storeDetails.phone').optional().trim(),
    body('storeDetails.niche').optional().trim(),
    handleValidation
];

module.exports = {
    validateProduct,
    validateExpense,
    validateSale,
    validateLogin,
    validateRegister,
    validatePasswordUpdate,
    validateProfileUpdate
};
