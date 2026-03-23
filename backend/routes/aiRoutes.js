const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    chatWithAI,
    getDailyBriefing,
    explainInsight,
} = require('../controllers/aiController');

// AI Features
router.post('/chat', protect, chatWithAI);
router.get('/briefing', protect, getDailyBriefing);
router.post('/explain', protect, explainInsight);

module.exports = router;
