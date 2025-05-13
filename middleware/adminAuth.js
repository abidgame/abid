const jwt = require('jsonwebtoken');

exports.verifyAdmin = (req, res, next) => {
  const token = req.cookies.admin_token;
  
  jwt.verify(token, process.env.ADMIN_JWT_SECRET, (err, decoded) => {
    if (err || !decoded.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.admin = decoded;
    next();
  });
};