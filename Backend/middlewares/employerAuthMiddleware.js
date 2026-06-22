const jwt = require('jsonwebtoken');
const Employer = require('../models/Employer');

const requireEmployerAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'employer') {
      return res.status(403).json({ success: false, message: 'Access denied. Not an employer account.' });
    }

    const employer = await Employer.findById(decoded.id).select('-password');
    if (!employer) return res.status(401).json({ success: false, message: 'Employer not found.' });
    if (employer.isBlocked) return res.status(403).json({ success: false, message: 'Your account has been suspended.' });

    req.employer = employer;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

module.exports = { requireEmployerAuth };