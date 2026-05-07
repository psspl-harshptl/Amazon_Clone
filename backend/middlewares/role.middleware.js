const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  next();
};

const requireApprovedSeller = (req, res, next) => {
  if (!req.user || req.user.role !== 'seller') {
    return res.status(403).json({ success: false, message: 'Seller access required' });
  }
  if (req.user.sellerStatus !== 'approved') {
    return res.status(403).json({ success: false, message: 'Your seller account is pending admin approval' });
  }
  next();
};

module.exports = { requireRole, requireApprovedSeller };
