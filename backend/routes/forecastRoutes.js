const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getForecast, explainForecastAI } = require('../controllers/forecastController');

router.get('/', protect, getForecast);
router.post('/explain', protect, explainForecastAI);

module.exports = router;
