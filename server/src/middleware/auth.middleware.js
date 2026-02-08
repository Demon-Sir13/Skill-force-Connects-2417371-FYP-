const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT and attach user to request
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });
    if (user.suspended) {
      return res.status(403).json({
        message: `Account suspended: ${user.suspendReason || 'Contact support'}`,
        suspended: true,
      });
    }
    req.user = user;
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError'
      ? 'Session expired, please log in again'
      : 'Token invalid';
    res.status(401).json({ message: msg });
  }
};

// Role-based access
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied: insufficient permissions' });
  }
  next();
};

// Ownership guard — user can only access their own resource
const isSelf = (req, res, next) => {
  const targetId = req.params.userId || req.params.id;
  if (req.user.role === 'admin') return next();
  if (req.user._id.toString() !== targetId) {
    return res.status(403).json({ message: 'Access denied: not your resource' });
  }
  next();
};

module.exports = { protect, authorize, isSelf };
