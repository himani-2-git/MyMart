const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    costPrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 0 },
    expiryDate: { type: Date },
    supplierName: { type: String },
    barcode: { type: String }
}, { timestamps: true });

// Index for category queries
productSchema.index({ category: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
