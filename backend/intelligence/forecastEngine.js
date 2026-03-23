/**
 * Forecast Engine — Pure demand forecasting logic.
 * No HTTP, no DB calls. Receives data, returns computed forecasts.
 */

const RISK_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

/**
 * Build weekly sales map from aggregated sales data.
 * @param {Array} salesAgg - Aggregated sales [{_id: {product, name, week}, totalQty, totalRevenue}]
 * @returns {Object} { [productId]: { name, weeks: [{week, qty, revenue}], totalQty } }
 */
const buildWeeklyMap = (salesAgg) => {
    const map = {};
    salesAgg.forEach(s => {
        const key = s._id.product?.toString() || s._id.name;
        if (!map[key]) {
            map[key] = { name: s._id.name, weeks: [], totalQty: 0 };
        }
        map[key].weeks.push({ week: s._id.week, qty: s.totalQty, revenue: s.totalRevenue });
        map[key].totalQty += s.totalQty;
    });
    return map;
};

/**
 * Detect trend from weekly quantities.
 * @param {number[]} weeklyQtys - Array of weekly sales quantities
 * @returns {'rising'|'declining'|'stable'}
 */
const detectTrend = (weeklyQtys) => {
    if (weeklyQtys.length < 2) return 'stable';
    const last = weeklyQtys[weeklyQtys.length - 1];
    const prev = weeklyQtys[weeklyQtys.length - 2];
    if (last > prev * 1.2) return 'rising';
    if (last < prev * 0.8) return 'declining';
    return 'stable';
};

/**
 * Assess stock risk based on days of remaining stock.
 * @param {number} daysOfStock
 * @returns {'critical'|'high'|'medium'|'low'}
 */
const assessRisk = (daysOfStock) => {
    if (daysOfStock <= 3) return 'critical';
    if (daysOfStock <= 7) return 'high';
    if (daysOfStock <= 14) return 'medium';
    return 'low';
};

/**
 * Compute demand forecasts for all products.
 * @param {Array} products - Product documents (lean)
 * @param {Object} weeklyMap - From buildWeeklyMap()
 * @returns {Array} Sorted forecast objects (critical first)
 */
const computeForecasts = (products, weeklyMap) => {
    const forecasts = products.map(product => {
        const data = weeklyMap[product._id.toString()];
        const weeklyQtys = data ? data.weeks.map(w => w.qty) : [];
        const avgWeekly = weeklyQtys.length > 0
            ? Math.round(weeklyQtys.reduce((a, b) => a + b, 0) / weeklyQtys.length)
            : 0;

        const trend = detectTrend(weeklyQtys);
        const daysOfStock = avgWeekly > 0 ? Math.round((product.quantity / avgWeekly) * 7) : 999;
        const riskLevel = assessRisk(daysOfStock);

        return {
            _id: product._id,
            name: product.name,
            category: product.category,
            currentStock: product.quantity,
            avgWeeklySales: avgWeekly,
            forecastNextWeek: avgWeekly,
            trend,
            daysOfStock,
            riskLevel,
            weeklyData: weeklyQtys,
            sellingPrice: product.sellingPrice,
        };
    });

    forecasts.sort((a, b) => RISK_ORDER[a.riskLevel] - RISK_ORDER[b.riskLevel]);
    return forecasts;
};

module.exports = {
    buildWeeklyMap,
    detectTrend,
    assessRisk,
    computeForecasts,
};
