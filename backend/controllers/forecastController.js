const Product = require('../models/Product');
const Sale = require('../models/Sale');
const { buildWeeklyMap, computeForecasts } = require('../intelligence/forecastEngine');
const aiNarrative = require('../intelligence/aiNarrativeEngine');

// @desc    Get demand forecasts based on historical sales
// @route   GET /api/forecast
// @access  Private
const getForecast = async (req, res, next) => {
    try {
        const fourWeeksAgo = new Date(Date.now() - 28 * 86400000);

        const [products, salesAgg] = await Promise.all([
            Product.find({}).lean(),
            Sale.aggregate([
                { $match: { createdAt: { $gte: fourWeeksAgo } } },
                { $unwind: '$orderItems' },
                {
                    $group: {
                        _id: {
                            product: '$orderItems.product',
                            name: '$orderItems.name',
                            week: { $isoWeek: '$createdAt' },
                        },
                        totalQty: { $sum: '$orderItems.qty' },
                        totalRevenue: { $sum: { $multiply: ['$orderItems.qty', '$orderItems.price'] } },
                    }
                },
                { $sort: { '_id.week': 1 } }
            ]),
        ]);

        const weeklyMap = buildWeeklyMap(salesAgg);
        const forecasts = computeForecasts(products, weeklyMap);

        res.json({ success: true, data: forecasts });
    } catch (error) {
        next(error);
    }
};

// @desc    Get AI explanation for forecast
// @route   POST /api/forecast/explain
// @access  Private
const explainForecastAI = async (req, res, next) => {
    try {
        const { forecastData } = req.body;
        const explanation = await aiNarrative.explainForecast(forecastData);
        res.json({ success: true, data: { explanation } });
    } catch (error) {
        if (error.message === 'AI_NOT_CONFIGURED') {
            return res.status(503).json({ success: false, message: 'AI service is not configured' });
        }
        next(error);
    }
};

module.exports = { getForecast, explainForecastAI };
