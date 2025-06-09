const express = require('express')
const router = express.Router()

const donationController = require('../controllers/donationController')
const {authenticateUser} = require('../middlewares/auth')

// Create a Razorpay order for donation
router.post('/create-order', authenticateUser, donationController.createDonationOrder);

// Verify Razorpay payment and record donation
router.post('/verify', authenticateUser, donationController.verifyDonation);

// Fetch logged-in user's donation history
router.get('/history', authenticateUser, donationController.getDonationHistory);

// Get receipt of a specific donation by ID
router.get('/receipt/:id', authenticateUser, donationController.getDonationReceipt);

module.exports = router;
