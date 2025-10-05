// Logger middleware
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.originalUrl} - ${req.ip}`);
  next();
};

module.exports = logger;