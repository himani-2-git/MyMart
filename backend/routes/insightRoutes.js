const express = require('express');
const router = express.Router();
const { getInsights } = require('../controllers/insightController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, admin, getInsights);

module.exports = router;
