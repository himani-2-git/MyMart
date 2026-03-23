const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Product = require('./models/Product');
const Sale = require('./models/Sale');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    let updatedCount = 0;
    const sales = await Sale.find({});
    
    // Cache products to minimize db queries
    const products = await Product.find({});
    const productMap = {};
    products.forEach(p => {
        productMap[p.name.trim().toLowerCase()] = p._id;
    });

    for (const sale of sales) {
        let changed = false;
        for (const item of sale.orderItems) {
            const correctId = productMap[item.name.trim().toLowerCase()];
            if (correctId && item.product.toString() !== correctId.toString()) {
                item.product = correctId;
                changed = true;
            }
        }
        if (changed) {
            await sale.save();
            updatedCount++;
        }
    }
    console.log(`Updated ${updatedCount} orphaned sales records!`);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
