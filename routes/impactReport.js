const express = require('express');
const router = express.Router();
const impactController = require('../controllers/impactReportController');
const { authenticateCharity } = require('../middlewares/auth');

// Create a new impact report
router.post('/', authenticateCharity, impactController.createReport);

// Get all reports (public)
router.get('/', impactController.getAllReports);

// Get reports by charity (public or protected — your choice)
router.get('/:charityId', impactController.getReportsByCharity);

// Update a report
router.put('/:id', authenticateCharity, impactController.updateReport);

// Delete a report
router.delete('/:id', authenticateCharity, impactController.deleteReport);




module.exports = router;
