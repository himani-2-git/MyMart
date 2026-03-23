const Product = require('../models/Product');
const { logActivity } = require('./activityController');

// @desc    Get all products (with optional search/filtering)
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res, next) => {
    try {
        const keyword = req.query.keyword
            ? { name: { $regex: req.query.keyword, $options: 'i' } }
            : {};

        const category = req.query.category && req.query.category !== 'All'
            ? { category: req.query.category }
            : {};

        const products = await Product.find({ ...keyword, ...category }).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a product or restock existing
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
    try {
        const productName = (req.body.name || '').trim();
        if (!productName) {
            return res.status(400).json({ success: false, message: 'Product name required' });
        }
        // Escape special chars to prevent regex crashes
        const escapedName = productName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const existingProduct = await Product.findOne({ name: { $regex: new RegExp(`^${escapedName}$`, 'i') } });

        if (existingProduct) {
            existingProduct.quantity += Number(req.body.quantity);
            if (req.body.costPrice) existingProduct.costPrice = req.body.costPrice;
            if (req.body.sellingPrice) existingProduct.sellingPrice = req.body.sellingPrice;
            
            const updatedProduct = await existingProduct.save();
            await logActivity(req.user._id, 'product_updated', 'product', updatedProduct._id, `Restocked product: ${updatedProduct.name} (+${req.body.quantity})`);
            return res.status(200).json(updatedProduct);
        }

        const product = new Product(req.body);
        const createdProduct = await product.save();
        await logActivity(req.user._id, 'product_added', 'product', createdProduct._id, `Added product: ${createdProduct.name}`);
        res.status(201).json(createdProduct);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        Object.assign(product, req.body);
        const updatedProduct = await product.save();
        await logActivity(req.user._id, 'product_updated', 'product', updatedProduct._id, `Updated product: ${updatedProduct.name}`);
        res.json(updatedProduct);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        await product.deleteOne();
        await logActivity(req.user._id, 'product_deleted', 'product', product._id, `Deleted product: ${product.name}`);
        res.json({ success: true, message: 'Product removed' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };
