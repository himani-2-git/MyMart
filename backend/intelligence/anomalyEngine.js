/**
 * Anomaly Engine — Pure anomaly detection logic.
 * No HTTP, no DB calls. Receives data, returns detected anomalies.
 */

const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2 };

/**
 * Detect sales spike anomaly.
 * @param {number} todaySales - Number of sales today
 * @param {number} monthSales - Number of sales in last 30 days
 * @param {Date} now
 * @returns {Object|null} Anomaly object or null
 */
const detectSalesSpike = (todaySales, monthSales, now) => {
    const dailyAvg = monthSales / 30;
    if (dailyAvg > 0 && todaySales > dailyAvg * 3) {
        return {
            id: 'sales-spike',
            type: 'Sales Spike',
            severity: 'warning',
            description: `Today's orders (${todaySales}) are ${Math.round(todaySales / dailyAvg)}x above the daily average (${Math.round(dailyAvg)}).`,
            data: { todaySales, dailyAvg: Math.round(dailyAvg), multiplier: Math.round(todaySales / dailyAvg) },
            detectedAt: now,
        };
    }
    return null;
};

/**
 * Detect sudden inventory drops.
 * @param {Array} recentSalesAgg - [{_id, totalSold, productName}]
 * @param {Object} productMap - { [productId]: product }
 * @param {Date} now
 * @returns {Array} Anomaly objects
 */
const detectInventoryDrops = (recentSalesAgg, productMap, now) => {
    const anomalies = [];
    recentSalesAgg.forEach(s => {
        const product = productMap[s._id?.toString()];
        if (!product) return;
        const originalStock = product.quantity + s.totalSold;
        if (originalStock > 10 && s.totalSold > originalStock * 0.5) {
            anomalies.push({
                id: `inventory-drop-${product._id}`,
                type: 'Inventory Drop',
                severity: 'critical',
                description: `${product.name} lost ${s.totalSold} units today (${Math.round(s.totalSold / originalStock * 100)}% of stock).`,
                data: { productName: product.name, sold: s.totalSold, remaining: product.quantity, original: originalStock },
                detectedAt: now,
            });
        }
    });
    return anomalies;
};

/**
 * Detect unusually large transactions.
 * @param {Array} largeSales - Recent large sale documents
 * @param {number} avgSaleAmount - Average sale total over last 30 days
 * @returns {Array} Anomaly objects
 */
const detectUnusualTransactions = (largeSales, avgSaleAmount) => {
    const anomalies = [];
    if (avgSaleAmount <= 0) return anomalies;
    largeSales.forEach(sale => {
        if (sale.totalPrice > avgSaleAmount * 5) {
            anomalies.push({
                id: `large-sale-${sale._id}`,
                type: 'Unusual Transaction',
                severity: 'info',
                description: `Transaction of $${sale.totalPrice.toFixed(2)} is ${Math.round(sale.totalPrice / avgSaleAmount)}x the average ($${avgSaleAmount.toFixed(2)}).`,
                data: { saleId: sale._id, amount: sale.totalPrice, average: avgSaleAmount },
                detectedAt: sale.createdAt,
            });
        }
    });
    return anomalies;
};

/**
 * Detect stagnant (zero-sale) high-stock products.
 * @param {Array} products - All products
 * @param {Set} soldProductIds - IDs of products sold this week
 * @param {Date} now
 * @returns {Object|null} Anomaly object or null
 */
const detectStagnantInventory = (products, soldProductIds, now) => {
    const stagnant = products.filter(p =>
        p.quantity > 20 && !soldProductIds.has(p._id.toString())
    );
    if (stagnant.length > 5) {
        return {
            id: 'stagnant-inventory',
            type: 'Stagnant Inventory',
            severity: 'warning',
            description: `${stagnant.length} high-stock products had zero sales this week.`,
            data: { count: stagnant.length, products: stagnant.slice(0, 5).map(p => p.name) },
            detectedAt: now,
        };
    }
    return null;
};

/**
 * Sort anomalies by severity (critical first).
 */
const sortBySeverity = (anomalies) => {
    return [...anomalies].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
};

module.exports = {
    detectSalesSpike,
    detectInventoryDrops,
    detectUnusualTransactions,
    detectStagnantInventory,
    sortBySeverity,
};
