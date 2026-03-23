require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne({ email: 'admin@mymart.com' });
        console.log("User:", user);
        if (user) {
            const isMatch = await bcrypt.compare('password123', user.password);
            console.log("Password 'password123' match:", isMatch);
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
};

checkUser();
