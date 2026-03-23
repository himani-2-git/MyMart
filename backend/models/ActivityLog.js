const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    action: {
        type: String,
        required: true,
        enum: [
            'product_added', 'product_updated', 'product_deleted',
            'sale_completed',
            'expense_added', 'expense_updated', 'expense_deleted',
            'user_login', 'user_register',
            'password_changed',
            'ai_key_configured', 'ai_key_removed',
        ],
    },
    entity: {
        type: String,
        enum: ['product', 'sale', 'expense', 'user', 'ai_settings'],
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    details: {
        type: String,
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
