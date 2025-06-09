const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();


const saltRounds = 10;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

// Utility function for validation
function  isNotValid(str){
    if(str==undefined || str.length==0){
         return true;
    }
    else{
        return false;
    }
}

// -------------------- SIGNUP --------------------
exports.signUp = async (req, res) => {
  const { name, email, password ,phone ,address,role} = req.body;

  if (isNotValid(name) || isNotValid(email) || isNotValid(password)) {
    return res.status(400).json({ type: 'error', message: 'Invalid Form Data!' });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(403).json({ type: 'error', message: 'User already exists!' });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await User.create({ 
        name, 
        email, 
        password: hashedPassword,
        phone,
        address,
        role: role || 'user'
    });

    res.status(201).json({ type: 'success', message: 'User created successfully!' });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ type: 'error', message: 'Something went wrong!' });
  }
};

// -------------------- LOGIN --------------------
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (isNotValid(email) || isNotValid(password)) {
    return res.status(400).json({ type: 'error', message: 'Invalid Form Data!' });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ type: 'error', message: 'User not found!' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign(
        { userId: user.id, userEmail: user.email },
        JWT_SECRET_KEY,
        { expiresIn: '1h' } // You can adjust expiry duration
      );

      return res.status(200).json({
        type: 'success',
        message: 'Logged in successfully!',
        sessionToken: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          role: user.role,
        }
      });
    } else {
      return res.status(401).json({ type: 'error', message: 'Incorrect password!' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ type: 'error', message: 'Something went wrong!' });
  }
};





// --------------------GET PROFILE--------------------
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




//--------------------UPDATE PROFILE--------------------
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const { name, phone, address } = req.body;
    const updateData = {};
    
    // Only include fields that are provided in the request
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;

    await user.update(updateData);
    
    // Get updated user without password
    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    res.json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: err.message });
  }
};