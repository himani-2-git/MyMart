const mongoose = require('mongoose');
const dotenv = require('dotenv');

const User = require('./models/User');
const Product = require('./models/Product');
const Sale = require('./models/Sale');
const Expense = require('./models/Expense');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for Seeding');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

const importData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await User.deleteMany();
        await Product.deleteMany();
        await Sale.deleteMany();
        await Expense.deleteMany();

        // Insert User — pass plain text password; the User model's pre('save') hook hashes it
        await User.create([{
            name: 'Admin',
            email: 'admin@mymart.com',
            password: 'password123',
            role: 'Admin'
        }]);

        // Insert 20 Sample Products
        const sampleProducts = [
            { name: 'Apple', category: 'Fruits', costPrice: 0.5, sellingPrice: 1.0, quantity: 150 },
            { name: 'Banana', category: 'Fruits', costPrice: 0.2, sellingPrice: 0.5, quantity: 200 },
            // Milk is set to expire in 4 days to trigger the Near Expiry Insight
            { name: 'Milk 1L', category: 'Dairy', costPrice: 1.0, sellingPrice: 1.5, quantity: 50, expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000) },
            { name: 'Bread', category: 'Bakery', costPrice: 1.0, sellingPrice: 2.0, quantity: 30, expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
            { name: 'Eggs (12)', category: 'Dairy', costPrice: 2.0, sellingPrice: 3.5, quantity: 40 },
            { name: 'Chicken Breast', category: 'Meat', costPrice: 4.0, sellingPrice: 7.0, quantity: 25 },
            { name: 'Beef Mince', category: 'Meat', costPrice: 5.0, sellingPrice: 8.5, quantity: 20 },
            { name: 'Rice 5kg', category: 'Pantry', costPrice: 6.0, sellingPrice: 10.0, quantity: 60 },
            { name: 'Pasta', category: 'Pantry', costPrice: 1.0, sellingPrice: 2.5, quantity: 100 },
            { name: 'Tomato Sauce', category: 'Pantry', costPrice: 1.5, sellingPrice: 3.0, quantity: 80 },
            { name: 'Onions 1kg', category: 'Vegetables', costPrice: 1.0, sellingPrice: 2.0, quantity: 120 },
            { name: 'Potatoes 2kg', category: 'Vegetables', costPrice: 2.0, sellingPrice: 4.0, quantity: 90 },
            { name: 'Cereal', category: 'Pantry', costPrice: 3.0, sellingPrice: 5.0, quantity: 45 },
            { name: 'Orange Juice', category: 'Beverages', costPrice: 2.5, sellingPrice: 4.0, quantity: 60 },
            { name: 'Water 6-pack', category: 'Beverages', costPrice: 2.0, sellingPrice: 3.5, quantity: 200 },
            { name: 'Toilet Paper', category: 'Household', costPrice: 4.0, sellingPrice: 7.0, quantity: 50 },
            { name: 'Soap', category: 'Household', costPrice: 0.8, sellingPrice: 2.0, quantity: 150 },
            { name: 'Shampoo', category: 'Household', costPrice: 3.0, sellingPrice: 6.0, quantity: 40 },
            // Dog Food is set to low stock (9) 
            { name: 'Dog Food', category: 'Pets', costPrice: 10.0, sellingPrice: 18.0, quantity: 9 },
            { name: 'Chocolate', category: 'Snacks', costPrice: 1.0, sellingPrice: 2.5, quantity: 100 }
        ];

        const createdProducts = await Product.insertMany(sampleProducts);

        // Generate Sample Sales (Last 7 days)
        const sampleSales = [];
        for (let i = 0; i < 40; i++) { // 40 dummy sales across 7 days
            const daysAgo = Math.floor(Math.random() * 7);
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);

            const numItems = Math.floor(Math.random() * 3) + 1;
            const orderItems = [];
            let totalPrice = 0;

            for (let j = 0; j < numItems; j++) {
                const prodIndex = Math.floor(Math.random() * createdProducts.length);
                const prod = createdProducts[prodIndex];
                // Force mostly high sales on Dog Food to trigger the reorder insight > 5
                const qty = (prod.name === 'Dog Food') ? 6 : Math.floor(Math.random() * 3) + 1;

                orderItems.push({
                    name: prod.name,
                    qty,
                    price: prod.sellingPrice,
                    product: prod._id
                });
                totalPrice += qty * prod.sellingPrice;
            }

            sampleSales.push({
                orderItems,
                totalPrice,
                paymentMethod: i % 2 === 0 ? 'Cash' : 'Card',
                createdAt: date,
                updatedAt: date
            });
        }

        await Sale.insertMany(sampleSales);

        // Generate Sample Expenses
        await Expense.insertMany([
            { expenseType: 'Rent', amount: 1500, description: 'Monthly Rent', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
            { expenseType: 'Electricity', amount: 300, description: 'Utility Bill', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
            { expenseType: 'Salary', amount: 2000, description: 'Staff Salaries', date: new Date() }
        ]);

        console.log('✅ Data Imported Successfully!');
        process.exit();
    } catch (error) {
        console.error(`❌ Error with data import: ${error}`);
        process.exit(1);
    }
};

importData();
