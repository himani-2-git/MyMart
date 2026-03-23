const Groq = require('groq-sdk');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');

/**
 * AI Service — Manages AI client initialization and store context.
 * Uses a server-side Groq API key from .env.
 * Intelligence engines use _getAIModel for AI access.
 * Controllers use buildStoreContext for data gathering.
 */

// ── Initialize AI client (exposed for intelligence engines) ──
const _getAIModel = () => {
    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

    if (!apiKey || apiKey === 'your_groq_api_key_here') {
        throw new Error('AI_NOT_CONFIGURED');
    }

    const groq = new Groq({ apiKey });
    return {
        generateContent: async (prompt) => {
            const chatCompletion = await groq.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model,
            });
            return {
                response: {
                    text: () => chatCompletion.choices[0].message.content
                }
            };
        }
    };
};

// ── Build store context summary for prompts ──
const buildStoreContext = async () => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now - 7 * 86400000);
    const monthAgo = new Date(now - 30 * 86400000);

    const [products, todaySales, weekSales, monthExpenses] = await Promise.all([
        Product.find({}).lean(),
        Sale.find({ createdAt: { $gte: todayStart } }).lean(),
        Sale.find({ createdAt: { $gte: weekAgo } }).lean(),
        Expense.find({ date: { $gte: monthAgo } }).lean(),
    ]);

    const totalProducts = products.length;
    const lowStock = products.filter(p => p.quantity < 10);
    const outOfStock = products.filter(p => p.quantity <= 0);
    const nearExpiry = products.filter(p => {
        if (!p.expiryDate) return false;
        const diff = Math.ceil((new Date(p.expiryDate) - now) / 86400000);
        return diff > 0 && diff <= 7;
    });

    const todayRevenue = todaySales.reduce((s, sale) => s + sale.totalPrice, 0);
    const weekRevenue = weekSales.reduce((s, sale) => s + sale.totalPrice, 0);
    const monthExpenseTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);

    const productSales = {};
    weekSales.forEach(sale => {
        sale.orderItems.forEach(item => {
            const key = item.name || item.product?.toString();
            productSales[key] = (productSales[key] || 0) + item.qty;
        });
    });
    const topSellers = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, qty]) => `${name} (${qty} units)`);

    const categories = [...new Set(products.map(p => p.category))];

    return {
        summary: `STORE CONTEXT (as of ${now.toLocaleDateString()}):
- Total Products: ${totalProducts} across categories: ${categories.join(', ')}
- Low Stock (< 10): ${lowStock.length} products${lowStock.length > 0 ? ' — ' + lowStock.slice(0, 5).map(p => `${p.name}: ${p.quantity}`).join(', ') : ''}
- Out of Stock: ${outOfStock.length}
- Near Expiry (≤ 7 days): ${nearExpiry.length} products${nearExpiry.length > 0 ? ' — ' + nearExpiry.slice(0, 5).map(p => `${p.name}: expires ${new Date(p.expiryDate).toLocaleDateString()}`).join(', ') : ''}
- Today's Revenue: $${todayRevenue.toFixed(2)} from ${todaySales.length} orders
- This Week's Revenue: $${weekRevenue.toFixed(2)} from ${weekSales.length} orders
- This Month's Expenses: $${monthExpenseTotal.toFixed(2)}
- Top Sellers This Week: ${topSellers.length > 0 ? topSellers.join(', ') : 'No sales data'}`,
        raw: { totalProducts, lowStock, outOfStock, nearExpiry, todayRevenue, weekRevenue, monthExpenseTotal, todaySales, weekSales, topSellers, products, categories }
    };
};

module.exports = {
    _getAIModel,
    buildStoreContext,
};
