const ActivityLog = require('../models/ActivityLog');

// Helper: Log an activity (called from other controllers)
const logActivity = async (userId, action, entity, entityId, details, metadata) => {
    try {
        await ActivityLog.create({ userId, action, entity, entityId, details, metadata });
    } catch (err) {
        console.error('Activity log error:', err.message);
    }
};

// @desc    Get activity log
// @route   GET /api/activity
// @access  Private
const getActivityLog = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 30;

        const [activities, total] = await Promise.all([
            ActivityLog.find({})
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('userId', 'name email')
                .lean(),
            ActivityLog.countDocuments({}),
        ]);

        res.json({
            success: true,
            data: activities,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { logActivity, getActivityLog };
