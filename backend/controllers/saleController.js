const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const { logActivity } = require('./activityController');

// @desc    Create new sale and update inventory
// @route   POST /api/sales
// @access  Private/Admin
const addSaleItems = async (req, res, next) => {
    const { orderItems, paymentMethod, customerName, customerPhone } = req.body;

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Validate stock
            for (const item of orderItems) {
                const product = await Product.findById(item.product).session(session);
                if (!product) {
                    throw new Error(`Product not found: ${item.name}`);
                }
                if (product.quantity < item.qty) {
                    throw new Error(`Insufficient stock for ${item.name}. Available: ${product.quantity}, Requested: ${item.qty}`);
                }
            }

            // Calculate total price based on items
            const totalPrice = orderItems.reduce((acc, item) => acc + item.qty * item.price, 0);

            const sale = new Sale({
                orderItems,
                paymentMethod: paymentMethod || 'Cash',
                totalPrice,
                customerName: customerName || 'Walk-In',
                customerPhone: customerPhone || undefined
            });

            const createdSale = await sale.save({ session });

            // Auto-update Product Quantities (Deduct stock)
            for (const item of orderItems) {
                const product = await Product.findById(item.product).session(session);
                if (product) {
                    product.quantity -= item.qty;
                    await product.save({ session });
                }
            }

            await session.commitTransaction();
            session.endSession();

            const custDisplay = customerName || 'Walk-In';
            await logActivity(req.user._id, 'sale_completed', 'sale', createdSale._id, `Sale for ${custDisplay}: ${createdSale.totalPrice}`);

            res.status(201).json(createdSale);
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            
            if (error.message.includes('Insufficient stock') || error.message.includes('Product not found')) {
                return res.status(400).json({ success: false, message: error.message });
            }
            next(error);
        }
};

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private/Admin
const getSales = async (req, res, next) => {
    try {
        const sales = await Sale.find({}).sort({ createdAt: -1 });
        res.json(sales);
    } catch (error) {
        next(error);
    }
};

// @desc    Get sale by ID
// @route   GET /api/sales/:id
// @access  Private/Admin
const getSaleById = async (req, res, next) => {
    try {
        const sale = await Sale.findById(req.params.id);

        if (!sale) {
            return res.status(404).json({ success: false, message: 'Sale not found' });
        }

        res.json(sale);
    } catch (error) {
        next(error);
    }
};

// @desc    Get customer info by phone number
// @route   GET /api/sales/customer/:phone
// @access  Private/Admin
const getCustomerByPhone = async (req, res, next) => {
    try {
        const { phone } = req.params;
        // Find the most recent sale matching this phone number to get the name
        const recentSale = await Sale.findOne({ customerPhone: phone }).sort({ createdAt: -1 });
        
        if (!recentSale) {
            return res.json({ found: false });
        }
        
        // Find recent purchase history
        const history = await Sale.find({ customerPhone: phone })
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            found: true,
            customerName: recentSale.customerName,
            lastVisit: recentSale.createdAt,
            totalVisits: await Sale.countDocuments({ customerPhone: phone }),
            history: history
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { addSaleItems, getSales, getSaleById, getCustomerByPhone };
