/**
 * Insight Engine — Pure store analytics logic.
 * No HTTP, no DB calls. Receives data, returns structured insights.
 */

/**
 * Detect dead inventory — products with no sales in the period but still in stock.
 * @param {Array} products - Product documents
 * @param {Object} salesCountMap - { [productId]: totalQty }
 * @returns {Array}
 */
const detectDeadInventory = (products, salesCountMap) => {
    return products
        .filter(p => {
            const soldQty = salesCountMap[p._id.toString()] || 0;
            return soldQty === 0 && p.quantity > 0;
        })
        .map(p => ({ ...toPlain(p), reason: 'No sales in 30 days' }));
};

/**
 * Suggest discounts for near-expiry, overstocked products.
 * @param {Array} products
 * @param {Date} expiryThreshold - Products expiring before this date
 * @param {number} minStock - Minimum stock to be considered overstocked
 * @returns {Array}
 */
const suggestDiscounts = (products, expiryThreshold, minStock = 20) => {
    return products
        .filter(p => p.expiryDate && new Date(p.expiryDate) <= expiryThreshold && p.quantity > minStock)
        .map(p => ({ ...toPlain(p), suggestedDiscount: '10%' }));
};

/**
 * Suggest reorders for low-stock products.
 * @param {Array} products
 * @param {Object} salesCountMap - { [productId]: totalQty }
 * @param {number} lowStockThreshold
 * @returns {Array}
 */
const suggestReorders = (products, salesCountMap, lowStockThreshold = 10) => {
    return products
        .filter(p => p.quantity < lowStockThreshold)
        .map(p => {
            const soldQty = salesCountMap[p._id.toString()] || 0;
            const suggestQty = soldQty > 5 ? 50 : 20;
            return { ...toPlain(p), suggestedQuantity: suggestQty };
        });
};

/**
 * Build a sales count map from aggregated data.
 * @param {Array} salesAgg - [{_id, totalQty}]
 * @returns {Object} { [productId]: totalQty }
 */
const buildSalesCountMap = (salesAgg) => {
    const map = {};
    salesAgg.forEach(s => { map[s._id.toString()] = s.totalQty; });
    return map;
};

/**
 * Compute all insights for a given product set.
 * @param {Array} products
 * @param {Object} salesCountMap
 * @returns {{ deadInventory, discountSuggestions, reorderSuggestions }}
 */
const computeInsights = (products, salesCountMap) => {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    return {
        deadInventory: detectDeadInventory(products, salesCountMap),
        discountSuggestions: suggestDiscounts(products, sevenDaysFromNow),
        reorderSuggestions: suggestReorders(products, salesCountMap),
    };
};

// Helper: convert Mongoose doc to plain object if needed
const toPlain = (doc) => {
    if (typeof doc.toObject === 'function') return doc.toObject();
    return { ...doc };
};

module.exports = {
    detectDeadInventory,
    suggestDiscounts,
    suggestReorders,
    buildSalesCountMap,
    computeInsights,
};
