const User = require('../models/User');
const Charity = require('../models/Charity');

// 1. Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// 2. Get all charities
exports.getAllCharities = async (req, res) => {
  try {
    const charities = await Charity.findAll();
    res.json(charities);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch charities' });
  }
};

// 3. Approve charity
exports.approveCharity = async (req, res) => {
  try {
    const charity = await Charity.findByPk(req.params.id);
    if (!charity) return res.status(404).json({ message: 'Charity not found' });

    charity.isApproved = true;
    await charity.save();
    res.json({ message: 'Charity approved', charity });
  } catch (err) {
    res.status(500).json({ message: 'Failed to approve charity' });
  }
};

// 4. Delete User
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

// 5. Delete Charity
exports.deleteCharity = async (req, res) => {
  try {
    const charity = await Charity.findByPk(req.params.id);
    if (!charity) return res.status(404).json({ message: 'Charity not found' });

    await charity.destroy();
    res.json({ message: 'Charity deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete charity' });
  }
};
