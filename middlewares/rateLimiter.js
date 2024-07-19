const rateLimit = require('express-rate-limit');

exports.loginLimiter = rateLimit({
  windowMs: 2 * 60 * 60 * 1000,
  max: 5,
  message: 'Login attempts exceeded. Please try again later.',
});
