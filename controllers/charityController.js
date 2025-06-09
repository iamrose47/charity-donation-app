const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Charity = require('../models/Charity');
require('dotenv').config();

const saltRounds = 10;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

// Utility
function isInvalid(str) {
  return !str || str.trim().length === 0;
}

// -------------------- REGISTER --------------------
exports.registerCharity = async (req, res) => {
  const { name, email, password, description,phone, mission, category, location, donationGoal, website } = req.body;

  if (isInvalid(name) || isInvalid(email) || isInvalid(password)) {
    return res.status(400).json({ message: 'Name, Email, and Password are required.' });
  }

  try {
    const existing = await Charity.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Charity already registered with this email.' });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const charity = await Charity.create({
      name,
      email,
      password: hashedPassword,
      phone,
      description,
      mission,
      category,
      location,
      donationGoal,
      website,
      currentAmount: 0
    });

    res.status(201).json({ message: 'Charity registered successfully', charityId: charity.id });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// -------------------- LOGIN --------------------
exports.loginCharity = async (req, res) => {
  const { email, password } = req.body;

  if (isInvalid(email) || isInvalid(password)) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  try {
    const charity = await Charity.findOne({ where: { email } });

    if (!charity) {
      return res.status(404).json({ message: 'Charity not found' });
    }

    const isMatch = await bcrypt.compare(password, charity.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    const token = jwt.sign({ charityId: charity.id }, JWT_SECRET_KEY, { expiresIn: '1d' });

    res.status(200).json({
      message: 'Login successful',
      token,
      charity: {
        id: charity.id,
        name: charity.name,
        email: charity.email,
        role: charity.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// -------------------- GET PROFILE --------------------
exports.getCharityProfile = async (req, res) => {
  try {
    const charity = await Charity.findByPk(req.charity.id, {
      attributes: { exclude: ['password'] }
    });

    if (!charity) {
      return res.status(404).json({ message: 'Charity not found' });
    }

    res.json(charity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------- UPDATE PROFILE --------------------
exports.updateCharityProfile = async (req, res) => {
  try {
    const charity = await Charity.findByPk(req.charity.id);
    if (!charity) {
      return res.status(404).json({ message: 'Charity not found' });
    }

    const updateData = {};
    const fields = ['name', 'description', 'mission', 'category', 'location', 'donationGoal', 'website'];

    fields.forEach(field => {
      if (req.body[field]) {
        updateData[field] = req.body[field];
      }
    });

    await charity.update(updateData);

    const updated = await Charity.findByPk(req.charity.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({ message: 'Profile updated successfully', charity: updated });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// -------------------- APPROVE CHARITY (ADMIN) --------------------
exports.approveCharity = async (req, res) => {
  const { id } = req.params;
  try {
    const charity = await Charity.findByPk(id);
    if (!charity) {
      return res.status(404).json({ message: 'Charity not found' });
    }

    charity.isApproved = true;
    await charity.save();

    res.json({ message: 'Charity approved successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
