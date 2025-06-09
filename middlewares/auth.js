const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Charity = require('../models/Charity');
require('dotenv').config();

exports.authenticateUser  = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  console.log("Authorization Header:", authHeader);

  if (!authHeader) {
    return res.status(401).json({ type: "error", message: "Authorization token missing!" });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  console.log("Token:", token);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log("Payload:", payload);

    const user = await User.findByPk(payload.userId);
    if (!user) {
      return res.status(401).json({ type: "error", message: "User not found!" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(401).json({ type: "error", message: "Authorization Failed!" });
  }
};


// ------------------ CHARITY AUTH ------------------
exports.authenticateCharity = async (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ type: "error", message: "Authorization token missing!" });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const charity = await Charity.findByPk(payload.charityId);

    if (!charity) {
      return res.status(401).json({ type: "error", message: "Charity not found!" });
    }

    req.charity = charity;
    next();
  } catch (error) {
    console.error('Charity Auth Error:', error);
    return res.status(401).json({ type: "error", message: "Authorization Failed!" });
  }
};

//------------------Admin AUTH-----------

exports.authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};
