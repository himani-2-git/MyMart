const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ── Security Middleware ──
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ── Rate Limiting ──
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500,
    message: { success: false, message: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(generalLimiter);

// Stricter rate limit for auth routes (brute-force protection)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: { success: false, message: 'Too many login attempts, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

// ── AI Rate Limiting ──
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
    message: { success: false, message: 'Too many AI requests, please slow down' },
    standardHeaders: true,
    legacyHeaders: false,
});

// ── Routes ──
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/sales', require('./routes/saleRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/insights', require('./routes/insightRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/ai', aiLimiter, require('./routes/aiRoutes'));
app.use('/api/forecast', require('./routes/forecastRoutes'));
app.use('/api/anomalies', require('./routes/anomalyRoutes'));
app.use('/api/activity', require('./routes/activityRoutes'));
app.use('/api/reorder', require('./routes/reorderRoutes'));

// Basic route for testing
app.get('/', (req, res) => {
    res.json({ success: true, message: 'MyMart API is running...' });
});

// ── Error Handling ──
app.use(notFound);
app.use(errorHandler);

// Define Ports
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
