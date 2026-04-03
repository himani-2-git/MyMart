const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const path = require('path');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { getAllowedOrigins, isAIConfigured, validateEnv } = require('./config/env');

// Load environment variables
dotenv.config();

// Validate required environment variables
const { port, nodeEnv } = validateEnv();

// Connect to MongoDB
connectDB();

const app = express();

// ── Security Middleware ──
app.use(helmet({
    contentSecurityPolicy: false, // Allows React SPA to load resources normally in prod
}));
app.use(cors({
    origin: getAllowedOrigins(),
    credentials: true
}));
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

// ── System Endpoints ──
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
            status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            connected: mongoose.connection.readyState === 1
        },
        ai: {
            configured: isAIConfigured()
        }
    });
});

app.get('/readyz', (req, res) => {
    if (mongoose.connection.readyState === 1) {
        res.status(200).send('OK');
    } else {
        res.status(503).send('Database not ready');
    }
});

// ── Serve Frontend in Production ──
if (nodeEnv === 'production') {
    const frontendDist = path.join(__dirname, '../frontend/dist');
    app.use(express.static(frontendDist));

    app.use((req, res, next) => {
        if (req.originalUrl.startsWith('/api')) {
            return next();
        }
        res.sendFile(path.resolve(__dirname, '../frontend/dist/index.html'));
    });
} else {
    // Basic route for testing
    app.get('/', (req, res) => {
        res.json({ success: true, message: 'MyMart API is running...' });
    });
}

// ── Error Handling ──
app.use(notFound);
app.use(errorHandler);

// Define Ports
const PORT = port || 5000;

const server = app.listen(PORT, () => {
    console.log(`🚀 Server running in ${nodeEnv} mode on port ${PORT}`);
});

// ── Graceful Shutdown ──
const shutdown = async () => {
    console.log('\nShutting down server gently...');
    server.close(() => {
        console.log('HTTP server closed.');
    });
    
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close(false);
        console.log('MongoDB connection closed.');
    }
    process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
