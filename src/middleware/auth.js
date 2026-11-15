const jwt = require('jsonwebtoken');

// Checks the Bearer token and attaches the logged-in user to req.user
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Please log in first.' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Your session expired. Please log in again.' });
  }
}

// Only lets admins through (use after requireAuth)
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin')
    return res.status(403).json({ error: 'Admins only.' });
  next();
}

module.exports = { requireAuth, requireAdmin };
