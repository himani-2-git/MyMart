const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');

// @desc    Get dashboard stats with real trends
// @route   GET /api/dashboard?period=weekly
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
    try {
        const period = req.query.period || 'weekly';

        // Determine date ranges based on period
        const now = new Date();
        let currentStart, previousStart, previousEnd, chartDays;

        switch (period) {
            case 'daily':
                currentStart = new Date(now); currentStart.setHours(0, 0, 0, 0);
                previousStart = new Date(currentStart); previousStart.setDate(previousStart.getDate() - 1);
                previousEnd = new Date(currentStart);
                chartDays = 24; // hours for daily
                break;
            case 'monthly':
                currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
                previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                previousEnd = new Date(currentStart);
                chartDays = 30;
                break;
            case 'weekly':
            default:
                currentStart = new Date(now); currentStart.setDate(now.getDate() - 7); currentStart.setHours(0, 0, 0, 0);
                previousStart = new Date(currentStart); previousStart.setDate(previousStart.getDate() - 7);
                previousEnd = new Date(currentStart);
                chartDays = 7;
                break;
        }

        // ── Aggregation: Current period sales ──
        const [currentSalesAgg] = await Sale.aggregate([
            { $match: { createdAt: { $gte: currentStart } } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalPrice' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // ── Aggregation: Previous period sales (for trend comparison) ──
        const [previousSalesAgg] = await Sale.aggregate([
            { $match: { createdAt: { $gte: previousStart, $lt: previousEnd } } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalPrice' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // ── Today's sales ──
        const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
        const [todaySalesAgg] = await Sale.aggregate([
            { $match: { createdAt: { $gte: todayStart } } },
            { $group: { _id: null, total: { $sum: '$totalPrice' }, count: { $sum: 1 } } }
        ]);

        // ── Total expenses ──
        const [currentExpenseAgg] = await Expense.aggregate([
            { $match: { date: { $gte: currentStart } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const [previousExpenseAgg] = await Expense.aggregate([
            { $match: { date: { $gte: previousStart, $lt: previousEnd } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const [allExpenseAgg] = await Expense.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const [allSalesAgg] = await Sale.aggregate([
            { $group: { _id: null, total: { $sum: '$totalPrice' }, count: { $sum: 1 } } }
        ]);

        // ── Product stats ──
        const products = await Product.find({});
        const sevenDaysFromNow = new Date(); sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        const lowStock = products.filter(p => p.quantity < 10).length;
        const nearExpiry = products.filter(p => p.expiryDate && new Date(p.expiryDate) <= sevenDaysFromNow && new Date(p.expiryDate) > now).length;

        // ── Calculate trends ──
        const calcTrend = (current, previous) => {
            if (!previous || previous === 0) return current > 0 ? '+100%' : '0%';
            const pct = ((current - previous) / previous * 100).toFixed(1);
            return pct >= 0 ? `+${pct}%` : `${pct}%`;
        };

        const currentRev = currentSalesAgg?.totalRevenue || 0;
        const prevRev = previousSalesAgg?.totalRevenue || 0;
        const currentExp = currentExpenseAgg?.total || 0;
        const prevExp = previousExpenseAgg?.total || 0;
        const totalRevenue = allSalesAgg?.total || 0;
        const totalExpenses = allExpenseAgg?.total || 0;

        // ── Chart data: Last N days revenue ──
        const chartData = [];
        for (let i = chartDays - 1; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            chartData.push({
                date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                dayStart: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
                dayEnd: new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1),
                revenue: 0
            });
        }

        // Fill chart data with actual sales
        const chartSales = await Sale.aggregate([
            { $match: { createdAt: { $gte: chartData[0].dayStart } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    revenue: { $sum: '$totalPrice' }
                }
            }
        ]);

        chartSales.forEach(s => {
            const matchDate = new Date(s._id.year, s._id.month - 1, s._id.day);
            const idx = chartData.findIndex(d =>
                d.dayStart.getTime() === matchDate.getTime()
            );
            if (idx !== -1) chartData[idx].revenue = +s.revenue.toFixed(2);
        });

        // Clean up chart data (remove internal fields)
        const cleanChartData = chartData.map(({ date, revenue }) => ({ date, revenue }));

        // ── Category breakdown (top 3 from all sales) ──
        const categoryAgg = await Sale.aggregate([
            { $unwind: '$orderItems' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'orderItems.product',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: { $ifNull: ['$productInfo.category', 'Other'] },
                    revenue: { $sum: { $multiply: ['$orderItems.qty', '$orderItems.price'] } }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 3 }
        ]);

        const catTotal = categoryAgg.reduce((a, c) => a + c.revenue, 0) || 1;
        const categoryColors = ['#54c750', '#06b6d4', '#22c55e'];
        const topCategories = categoryAgg.map((c, i) => ({
            name: c._id,
            rev: c.revenue.toFixed(2),
            pct: Math.round((c.revenue / catTotal) * 100),
            color: categoryColors[i] || '#6b7280'
        }));

        // ── Recent sales (last 5) ──
        const recentSales = await Sale.find({}).sort({ createdAt: -1 }).limit(5);
        const recentActivities = recentSales.map(s => {
            const mins = Math.round((Date.now() - new Date(s.createdAt)) / 60000);
            let time;
            if (mins < 1) time = 'just now';
            else if (mins < 60) time = `${mins} min ago`;
            else if (mins < 1440) time = `${Math.round(mins / 60)}h ago`;
            else time = `${Math.round(mins / 1440)}d ago`;

            const item = s.orderItems[0]?.name || 'product';
            const customerName = s.customerName && s.customerName !== 'Walk-In' 
                ? s.customerName 
                : `Customer ${s._id.toString().slice(-4)}`;
                
            return {
                name: customerName,
                action: `purchased ${item}`,
                time,
                total: s.totalPrice
            };
        });

        res.json({
            stats: {
                totalRevenue: totalRevenue.toFixed(2),
                todaySales: (todaySalesAgg?.total || 0).toFixed(2),
                netProfit: (totalRevenue - totalExpenses).toFixed(2),
                totalExpenses: totalExpenses.toFixed(2),
                totalProducts: products.length,
                lowStock,
                nearExpiry,
                totalSalesCount: allSalesAgg?.count || 0,
            },
            trends: {
                revenue: calcTrend(currentRev, prevRev),
                revenuePositive: currentRev >= prevRev,
                orders: calcTrend(currentSalesAgg?.count || 0, previousSalesAgg?.count || 0),
                ordersPositive: (currentSalesAgg?.count || 0) >= (previousSalesAgg?.count || 0),
                expenses: calcTrend(currentExp, prevExp),
                expensesPositive: currentExp <= prevExp, // less expenses = positive
            },
            chartData: cleanChartData,
            topCategories,
            recentActivities,
            period
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getDashboardStats };
