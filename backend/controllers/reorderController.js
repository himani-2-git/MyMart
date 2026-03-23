const Product = require('../models/Product');
const Sale = require('../models/Sale');
const reorderEngine = require('../intelligence/reorderEngine');
const aiNarrative = require('../intelligence/aiNarrativeEngine');

// @desc    Get reorder recommendations
// @route   GET /api/reorder/recommendations
// @access  Private
const getRecommendations = async (req, res, next) => {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

        const [products, salesAgg] = await Promise.all([
            Product.find({}).lean(),
            Sale.aggregate([
                { $match: { createdAt: { $gte: thirtyDaysAgo } } },
                { $unwind: '$orderItems' },
                { $group: { _id: '$orderItems.product', totalQty: { $sum: '$orderItems.qty' } } }
            ]),
        ]);

        const salesMap = reorderEngine.buildSalesMap(salesAgg);
        const recommendations = reorderEngine.computeRecommendations(products, salesMap);

        res.json({ success: true, data: recommendations });
    } catch (error) {
        next(error);
    }
};

// @desc    Get AI explanation for a reorder recommendation
// @route   POST /api/reorder/explain
// @access  Private
const explainReorder = async (req, res, next) => {
    try {
        const { recommendation } = req.body;
        if (!recommendation) {
            return res.status(400).json({ success: false, message: 'Recommendation data required' });
        }
        const explanation = await aiNarrative.explainReorder(recommendation);
        res.json({ success: true, data: { explanation } });
    } catch (error) {
        if (error.message === 'AI_NOT_CONFIGURED') {
            return res.status(503).json({ success: false, message: 'AI service is not configured' });
        }
        next(error);
    }
};

module.exports = { getRecommendations, explainReorder };
