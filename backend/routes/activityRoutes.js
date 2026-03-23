const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getActivityLog } = require('../controllers/activityController');

router.get('/', protect, getActivityLog);

module.exports = router;
