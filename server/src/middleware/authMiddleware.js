import jwt from 'jsonwebtoken';
import { User, Member } from '../models/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'champions_club_secret_key_2026_super_secure';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Authentication required. No authorization token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Find user by _id or custom id
    const user = await User.findOne({
      $or: [
        { _id: decoded.id.match(/^[0-9a-fA-F]{24}$/) ? decoded.id : null },
        { id: decoded.id }
      ].filter(Boolean)
    });

    if (!user) {
      return res.status(401).json({ message: 'User belonging to this token no longer exists.' });
    }

    req.user = {
      id: user.id || user._id.toString(),
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      memberId: user.memberId
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired authorization token.', error: error.message });
  }
};

export const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({
      $or: [
        { _id: decoded.id && decoded.id.match(/^[0-9a-fA-F]{24}$/) ? decoded.id : null },
        { id: decoded.id }
      ].filter(Boolean)
    });

    if (user) {
      req.user = {
        id: user.id || user._id.toString(),
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        memberId: user.memberId
      };
    }
  } catch (error) {
    // Optional auth continues even if token expired or invalid
  }
  next();
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access forbidden: Role '${req.user.role}' is not authorized for this resource.` });
    }
    next();
  };
};

export const requireSelfOrAdmin = (getParamUserId = req => req.params.userId || req.params.id) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Authentication required.' });
    if (req.user.role === 'admin' || req.user.role === 'staff') return next();
    const targetId = getParamUserId(req);
    if (req.user.id === targetId || req.user.memberId === targetId) return next();
    return res.status(403).json({ message: 'Access forbidden: You cannot access another member private records.' });
  };
};

export default { protect, requireRole, requireSelfOrAdmin };
