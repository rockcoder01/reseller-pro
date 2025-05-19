const db = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = db.user;
const JWT_SECRET = process.env.JWT_SECRET || 'resellpro-secret-key';
const JWT_EXPIRATION = 86400; // 24 hours

// Register new user
exports.register = async (req, res) => {
  try {
    // Check if username or email already exists
    const existingUser = await User.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { username: req.body.username },
          { email: req.body.email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already in use!' });
    }

    // Create a new user
    const user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      companyName: req.body.companyName,
      role: 'user'
    });

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRATION
    });

    // Return user info and token
    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        companyName: user.companyName,
        role: user.role
      },
      token: token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// User login
exports.login = async (req, res) => {
  try {
    // Find user by email
    const user = await User.findOne({
      where: {
        email: req.body.email
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate password
    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

    if (!passwordIsValid) {
      return res.status(401).json({ message: 'Invalid password!' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRATION
    });

    // Return user info and token
    res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        companyName: user.companyName,
        role: user.role
      },
      token: token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Prevent password update through this endpoint
    if (req.body.password) {
      delete req.body.password;
    }
    
    // Also prevent role changes
    if (req.body.role) {
      delete req.body.role;
    }
    
    const updatedUser = await User.update(req.body, {
      where: { id: userId },
      returning: true
    });
    
    if (updatedUser[0] === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = updatedUser[1][0];
    
    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      companyName: user.companyName,
      role: user.role
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get user
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Validate old password
    const passwordIsValid = bcrypt.compareSync(req.body.oldPassword, user.password);
    
    if (!passwordIsValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Update with new password
    await User.update(
      { password: bcrypt.hashSync(req.body.newPassword, 8) },
      { where: { id: userId } }
    );
    
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
