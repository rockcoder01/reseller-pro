const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.user;

const JWT_SECRET = process.env.JWT_SECRET || 'resellpro-secret-key';

// Verify JWT token
const verifyToken = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  // Verify token
  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
    
    try {
      // Check if user exists
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized: User not found' });
      }
      
      // Attach user id to request object
      req.userId = user.id;
      
      next();
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
};

module.exports = {
  verifyToken
};
