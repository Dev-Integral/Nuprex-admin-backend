const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Protect routes: Ensures the user is logged in
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token provided' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the admin by id from the token payload
    req.admin = await Admin.findByPk(decoded.id);

    if (!req.admin) {
      return res.status(401).json({ error: 'Not authorized, user not found' });
    }

    next();
  } catch (err) {
    res.status(401).json({ error: 'Not authorized, token failed' });
  }
};

// Restrict to specific roles: Ensures only specific roles can access the route
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ error: 'You do not have permission to perform this action' });
    }
    next();
  };
};
