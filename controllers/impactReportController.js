const ImpactReport = require('../models/ImpactReport');
const Charity = require('../models/Charity');

// 1. Create a new Impact Report
exports.createReport = async (req, res) => {
  try {
    const { title, description, beneficiariesCount, fundsUtilized, reportDate } = req.body;

    const newReport = await ImpactReport.create({
      title,
      description,
      beneficiariesCount,
      fundsUtilized,
      reportDate,
      charityId: req.charity.id // Assuming req.user is a logged-in charity
    });
    console.log("req.charity =", req.charity); // Debug


    res.status(201).json({ message: 'Impact report created successfully', report: newReport });
  } catch (err) {
    console.error('Error creating impact report:', err);
    res.status(500).json({ message: 'Failed to create impact report' });
  }
};

// 2. Get all reports (public)
exports.getAllReports = async (req, res) => {
  try {
    const reports = await ImpactReport.findAll({
      include: {
        model: Charity,
        attributes: ['id', 'name', 'category']
      },
      order: [['reportDate', 'DESC']]
    });
    res.json(reports);
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
};

// 3. Get reports by specific charity
exports.getReportsByCharity = async (req, res) => {
  try {
    const { charityId } = req.params;
    const reports = await ImpactReport.findAll({
      where: { charityId: charityId },
      order: [['reportDate', 'DESC']]
    });

    res.json(reports);
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
};

// 4. Update report (only by charity who owns it)
exports.updateReport = async (req, res) => {
  try {
    const report = await ImpactReport.findByPk(req.params.id);

    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (report.charityId !== req.charity.id) {
      return res.status(403).json({ message: 'Unauthorized to update this report' });
    }

    await report.update(req.body);
    res.json({ message: 'Report updated successfully', report });
  } catch (err) {
    console.error('Error updating report:', err);
    res.status(500).json({ message: 'Failed to update report' });
  }
};

// 5. Delete report
exports.deleteReport = async (req, res) => {
  try {
    const report = await ImpactReport.findByPk(req.params.id);
    console.log('Logged-in charity ID:', req.charity.id);
    console.log('Report belongs to charity ID:', report.charityId);


    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (report.charityId !== req.charity.id) {
      return res.status(403).json({ message: 'Unauthorized to delete this report' });
    }

    await report.destroy();
    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    console.error('Error deleting report:', err);
    res.status(500).json({ message: 'Failed to delete report' });
  }
};
