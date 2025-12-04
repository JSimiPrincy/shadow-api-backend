const jwt = require('jsonwebtoken');
const TokenBlocklist = require('../data-access/models/TokenBlocklist');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    // 1. Check if token is in Blocklist (Logged out?)
    const blocklisted = await TokenBlocklist.findOne({ where: { token } });
    if (blocklisted) {
      return res.status(401).json({ success: false, message: 'Token expired/invalidated (Logged out)' });
    }

    // 2. Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.token = token; // Pass raw token to controller for logout
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

module.exports = { protect };