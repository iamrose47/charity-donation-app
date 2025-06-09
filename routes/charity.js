const express = require('express');
const router= express.Router();

const {authenticateCharity} = require('../middlewares/auth')
const charityController = require('../controllers/charityController')


// Charity Registration (Signup)
router.post('/register', charityController.registerCharity);

// Charity Login
router.post('/login', charityController.loginCharity);


// Get Charity Profile (Private)
router.get('/profile', authenticateCharity, charityController.getCharityProfile);

// Update Charity Profile (Private)
router.put('/profile', authenticateCharity, charityController.updateCharityProfile);

// Get all approved charities (Public)
router.get('/approved', charityController.approveCharity);

module.exports = router;
