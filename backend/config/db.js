const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
        
        // Add event listeners for connection state
        mongoose.connection.on("connected", () => console.log("MongoDB connected"));
        mongoose.connection.on("error", err => console.error("MongoDB error:", err));
        mongoose.connection.on("disconnected", () => console.warn("MongoDB disconnected"));
        
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;
