const aiService = require('../services/aiService');
const aiNarrative = require('../intelligence/aiNarrativeEngine');

// @desc    Chat with AI assistant
// @route   POST /api/ai/chat
// @access  Private
const chatWithAI = async (req, res, next) => {
    try {
        const { message } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Please provide a message' });
        }

        const context = await aiService.buildStoreContext();
        let currency = '$';
        if (req.headers['x-active-currency']) {
            try { currency = decodeURIComponent(req.headers['x-active-currency']); } catch(e) {}
        }
        const response = await aiNarrative.chat(context.summary, message.trim(), currency);
        res.json({ success: true, data: { response } });
    } catch (error) {
        if (error.message === 'AI_NOT_CONFIGURED') {
            return res.status(503).json({ success: false, message: 'AI service is not configured. Please contact your administrator.' });
        }
        next(error);
    }
};

// @desc    Get daily AI briefing
// @route   GET /api/ai/briefing
// @access  Private
const getDailyBriefing = async (req, res, next) => {
    try {
        const context = await aiService.buildStoreContext();
        let currency = '$';
        if (req.headers['x-active-currency']) {
            try { currency = decodeURIComponent(req.headers['x-active-currency']); } catch(e) {}
        }
        const briefing = await aiNarrative.generateBriefing(context.summary, currency);
        res.json({ success: true, data: { briefing } });
    } catch (error) {
        if (error.message === 'AI_NOT_CONFIGURED') {
            return res.json({ success: true, data: { briefing: null, unconfigured: true } });
        }
        next(error);
    }
};

// @desc    Get AI explanation for an insight
// @route   POST /api/ai/explain
// @access  Private
const explainInsight = async (req, res, next) => {
    try {
        const { type, product } = req.body;
        if (!type || !product) {
            return res.status(400).json({ success: false, message: 'Type and product data required' });
        }

        let currency = '$';
        if (req.headers['x-active-currency']) {
            try { currency = decodeURIComponent(req.headers['x-active-currency']); } catch(e) {}
        }
        const explanation = await aiNarrative.explainInsight(type, product, currency);
        res.json({ success: true, data: { explanation } });
    } catch (error) {
        if (error.message === 'AI_NOT_CONFIGURED') {
            return res.status(503).json({ success: false, message: 'AI service is not configured. Please contact your administrator.' });
        }
        next(error);
    }
};

module.exports = {
    chatWithAI,
    getDailyBriefing,
    explainInsight,
};
