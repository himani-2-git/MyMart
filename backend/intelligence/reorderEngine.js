/**
 * Reorder Engine — Pure reorder recommendation logic.
 * No HTTP, no DB calls. Receives data, returns recommendations.
 */

const REORDER_WINDOW = 7; // days
const STOCKOUT_THRESHOLD = 7; // days (changed from 3)
const ABSOLUTE_LOW_THRESHOLD = 5; // explicitly flag below 5 items regardless of sales

/**
 * Calculate average daily sales for a product.
 * @param {number} totalSold - Units sold in the period
 * @param {number} days - Number of days in the period
 * @returns {number}
 */
const calcAvgDailySales = (totalSold, days = 30) => {
    return totalSold / days;
};

/**
 * Calculate days until stockout.
 * @param {number} currentStock
 * @param {number} avgDailySales
 * @returns {number}
 */
const calcDaysUntilStockout = (currentStock, avgDailySales) => {
    if (avgDailySales <= 0) return Infinity;
    return currentStock / avgDailySales;
};

/**
 * Determine urgency level.
 * @param {number} daysUntilStockout
 * @param {number} currentStock
 * @returns {'critical'|'warning'|'safe'}
 */
const determineUrgency = (daysUntilStockout, currentStock) => {
    if (daysUntilStockout < 3 || currentStock <= 2) return 'critical';
    if (daysUntilStockout < STOCKOUT_THRESHOLD || currentStock <= ABSOLUTE_LOW_THRESHOLD) return 'warning';
    return 'safe';
};

/**
 * Calculate recommended reorder quantity.
 * @param {number} avgDailySales
 * @param {number} windowDays - Days of stock to cover (default: REORDER_WINDOW)
 * @returns {number}
 */
const calcReorderQty = (avgDailySales, windowDays = REORDER_WINDOW) => {
    const qty = Math.ceil(avgDailySales * windowDays);
    return qty > 10 ? qty : 20; // Ensure at least a batch of 20 if sales are low but stock is out
};

/**
 * Build sales map from aggregated data.
 * @param {Array} salesAgg - [{_id, totalQty}]
 * @returns {Object} { [productId]: totalQty }
 */
const buildSalesMap = (salesAgg) => {
    const map = {};
    salesAgg.forEach(s => { map[s._id?.toString()] = s.totalQty; });
    return map;
};

/**
 * Compute reorder recommendations for all products.
 * @param {Array} products - Product documents (lean)
 * @param {Object} salesMap - From buildSalesMap()
 * @param {number} periodDays - Sales period in days (default 30)
 * @returns {Array} Sorted recommendations (most urgent first)
 */
const computeRecommendations = (products, salesMap, periodDays = 30) => {
    const recommendations = [];

    products.forEach(product => {
        const totalSold = salesMap[product._id.toString()] || 0;
        const avgDailySales = calcAvgDailySales(totalSold, periodDays);
        const daysUntilStockout = calcDaysUntilStockout(product.quantity, avgDailySales);

        // Flag if it will run out soon, OR if stock is strictly <= 5
        if (daysUntilStockout < STOCKOUT_THRESHOLD || product.quantity <= ABSOLUTE_LOW_THRESHOLD) {
            const urgency = determineUrgency(daysUntilStockout, product.quantity);
            recommendations.push({
                _id: product._id,
                productName: product.name,
                category: product.category,
                currentStock: product.quantity,
                sellingPrice: product.sellingPrice,
                averageDailySales: Math.round((avgDailySales || 0) * 10) / 10,
                daysUntilStockout: avgDailySales > 0 ? Math.round(daysUntilStockout * 10) / 10 : 0,
                recommendedReorderQuantity: calcReorderQty(avgDailySales),
                urgency,
            });
        }
    });

    recommendations.sort((a, b) => {
        // Prioritize items with strictly 0 stock
        if (a.currentStock === 0 && b.currentStock !== 0) return -1;
        if (b.currentStock === 0 && a.currentStock !== 0) return 1;
        return a.daysUntilStockout - b.daysUntilStockout;
    });
    return recommendations;
};

module.exports = {
    calcAvgDailySales,
    calcDaysUntilStockout,
    determineUrgency,
    calcReorderQty,
    buildSalesMap,
    computeRecommendations,
    REORDER_WINDOW,
    STOCKOUT_THRESHOLD,
};
