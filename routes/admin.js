const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateUser, authorizeAdmin } = require('../middlewares/auth');

// All routes require admin
router.use(authenticateUser, authorizeAdmin);

router.get('/users', adminController.getAllUsers);
router.get('/charities', adminController.getAllCharities);
router.put('/charity/:id/approve', adminController.approveCharity);
router.delete('/user/:id', adminController.deleteUser);
router.delete('/charity/:id', adminController.deleteCharity);

module.exports = router;
