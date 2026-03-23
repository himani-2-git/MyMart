const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getRecommendations, explainReorder } = require('../controllers/reorderController');

router.get('/recommendations', protect, getRecommendations);
router.post('/explain', protect, explainReorder);

module.exports = router;
