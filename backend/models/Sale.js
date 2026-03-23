const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    orderItems: [
        {
            name: { type: String, required: true },
            qty: { type: Number, required: true },
            price: { type: Number, required: true },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Product'
            }
        }
    ],
    customerName: {
        type: String,
        default: 'Walk-In',
        trim: true
    },
    customerPhone: {
        type: String,
        trim: true,
        index: true
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Card', 'UPI'],
        default: 'Cash'
    }
}, { timestamps: true });

// Index for dashboard/insights queries
saleSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Sale', saleSchema);
