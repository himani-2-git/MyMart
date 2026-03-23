const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { logActivity } = require('./activityController');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            await logActivity(user._id, 'user_login', 'user', user._id, 'User logged in successfully');
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                storeDetails: user.storeDetails,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Register a new admin
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: 'Admin'
        });

        if (user) {
            await logActivity(user._id, 'user_register', 'user', user._id, 'New user registered');
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                storeDetails: user.storeDetails,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid user data' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update user password
// @route   PUT /api/auth/password
// @access  Private
const updatePassword = async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        await logActivity(user._id, 'password_changed', 'user', user._id, 'User password updated');

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.name = req.body.name || user.name;
        
        if (req.body.storeDetails) {
            user.storeDetails = {
                name: req.body.storeDetails.name !== undefined ? req.body.storeDetails.name : user.storeDetails.name,
                address: req.body.storeDetails.address !== undefined ? req.body.storeDetails.address : user.storeDetails.address,
                pin: req.body.storeDetails.pin !== undefined ? req.body.storeDetails.pin : user.storeDetails.pin,
                state: req.body.storeDetails.state !== undefined ? req.body.storeDetails.state : user.storeDetails.state,
                country: req.body.storeDetails.country !== undefined ? req.body.storeDetails.country : user.storeDetails.country,
                ownerName: req.body.storeDetails.ownerName !== undefined ? req.body.storeDetails.ownerName : user.storeDetails.ownerName,
                phone: req.body.storeDetails.phone !== undefined ? req.body.storeDetails.phone : user.storeDetails.phone,
                niche: req.body.storeDetails.niche !== undefined ? req.body.storeDetails.niche : user.storeDetails.niche,
            };
        }

        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            storeDetails: user.storeDetails,
            token: generateToken(user._id),
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { authUser, registerUser, updatePassword, updateProfile };
