const express = require('express');
const router = express.Router();
const { authUser, registerUser, updatePassword, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validateLogin, validateRegister, validatePasswordUpdate, validateProfileUpdate } = require('../middleware/validate');

router.post('/login', validateLogin, authUser);
router.post('/register', validateRegister, registerUser);
router.put('/password', protect, validatePasswordUpdate, updatePassword);
router.put('/profile', protect, validateProfileUpdate, updateProfile);

module.exports = router;
