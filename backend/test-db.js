require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (process.env.MONGODB_URI === 'YOUR_MONGODB_ATLAS_URI_HERE') {
            console.log('❌ PLEASE UPDATE THE MONGODB_URI IN YOUR .env FILE!');
            process.exit(1);
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
        process.exit(0);
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

connectDB();
