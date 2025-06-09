const express = require('express')
const router = express.Router();
const userController = require('../controllers/userController')
const {authenticateUser} = require('../middlewares/auth')


//signin
router.post('/signup',userController.signUp)
//Login
router.post('/login',userController.login)
// Get user profile
router.get('/profile', authenticateUser, userController.getProfile);

// Update user profile
router.put('/profile', authenticateUser, userController.updateProfile);


module.exports = router;