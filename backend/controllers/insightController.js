const Product = require('../models/Product');
const Sale = require('../models/Sale');
const insightEngine = require('../intelligence/insightEngine');

// @desc    Get smart insights (Dead inventory, Reorder, Discount)
// @route   GET /api/insights
// @access  Private/Admin
const getInsights = async (req, res, next) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [products, salesAgg] = await Promise.all([
            Product.find({}),
            Sale.aggregate([
                { $match: { createdAt: { $gte: thirtyDaysAgo } } },
                { $unwind: '$orderItems' },
                { $group: { _id: '$orderItems.product', totalQty: { $sum: '$orderItems.qty' } } }
            ]),
        ]);

        const salesCountMap = insightEngine.buildSalesCountMap(salesAgg);
        const insights = insightEngine.computeInsights(products, salesCountMap);

        res.json(insights);
    } catch (error) {
        next(error);
    }
};

module.exports = { getInsights };
