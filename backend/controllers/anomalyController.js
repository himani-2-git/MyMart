const Sale = require('../models/Sale');
const Product = require('../models/Product');
const anomalyEngine = require('../intelligence/anomalyEngine');
const aiNarrative = require('../intelligence/aiNarrativeEngine');

// @desc    Detect anomalies in sales and inventory
// @route   GET /api/anomalies
// @access  Private
const getAnomalies = async (req, res, next) => {
    try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(now - 7 * 86400000);
        const monthAgo = new Date(now - 30 * 86400000);

        // ── Parallel DB queries ──
        const [
            todaySales,
            monthSales,
            recentSalesAgg,
            products,
            largeSales,
            avgSaleAgg,
            weekSalesProducts,
        ] = await Promise.all([
            Sale.countDocuments({ createdAt: { $gte: todayStart } }),
            Sale.countDocuments({ createdAt: { $gte: monthAgo } }),
            Sale.aggregate([
                { $match: { createdAt: { $gte: todayStart } } },
                { $unwind: '$orderItems' },
                { $group: { _id: '$orderItems.product', totalSold: { $sum: '$orderItems.qty' }, productName: { $first: '$orderItems.name' } } }
            ]),
            Product.find({}).lean(),
            Sale.find({ createdAt: { $gte: weekAgo } }).sort({ totalPrice: -1 }).limit(5).lean(),
            Sale.aggregate([
                { $match: { createdAt: { $gte: monthAgo } } },
                { $group: { _id: null, avgTotal: { $avg: '$totalPrice' } } }
            ]),
            Sale.aggregate([
                { $match: { createdAt: { $gte: weekAgo } } },
                { $unwind: '$orderItems' },
                { $group: { _id: '$orderItems.product' } }
            ]),
        ]);

        const productMap = {};
        products.forEach(p => { productMap[p._id.toString()] = p; });
        const soldProductIds = new Set(weekSalesProducts.map(s => s._id?.toString()));
        const avgSaleAmount = avgSaleAgg[0]?.avgTotal || 0;

        // ── Delegate to anomaly engine ──
        const anomalies = [];

        const spike = anomalyEngine.detectSalesSpike(todaySales, monthSales, now);
        if (spike) anomalies.push(spike);

        anomalies.push(...anomalyEngine.detectInventoryDrops(recentSalesAgg, productMap, now));
        anomalies.push(...anomalyEngine.detectUnusualTransactions(largeSales, avgSaleAmount));

        const stagnant = anomalyEngine.detectStagnantInventory(products, soldProductIds, now);
        if (stagnant) anomalies.push(stagnant);

        const sorted = anomalyEngine.sortBySeverity(anomalies);
        res.json({ success: true, data: sorted });
    } catch (error) {
        next(error);
    }
};

// @desc    Get AI explanation for an anomaly
// @route   POST /api/anomalies/explain
// @access  Private
const explainAnomalyAI = async (req, res, next) => {
    try {
        const { anomaly } = req.body;
        const explanation = await aiNarrative.explainAnomaly(anomaly);
        res.json({ success: true, data: { explanation } });
    } catch (error) {
        if (error.message === 'AI_NOT_CONFIGURED') {
            return res.status(503).json({ success: false, message: 'AI service is not configured' });
        }
        next(error);
    }
};

module.exports = { getAnomalies, explainAnomalyAI };
