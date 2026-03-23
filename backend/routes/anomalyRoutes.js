const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getAnomalies, explainAnomalyAI } = require('../controllers/anomalyController');

router.get('/', protect, getAnomalies);
router.post('/explain', protect, explainAnomalyAI);

module.exports = router;
