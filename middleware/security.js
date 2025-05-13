const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// HTTP Headers Protection
exports.secureHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', '*.railway.app'],
      connectSrc: ["'self'", '*.mongodb.com']
    }
  }
});

// Rate Limiting
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Limit each IP to 100 requests per window
});