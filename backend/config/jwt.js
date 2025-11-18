require('dotenv').config();

module.exports = {
  // JWT secret key - should be in .env file
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
  
  // JWT expiration time
  jwtExpiration: process.env.JWT_EXPIRATION || '24h',
  
  // Refresh token expiration
  refreshTokenExpiration: process.env.REFRESH_TOKEN_EXPIRATION || '7d',
  
  // Bcrypt salt rounds
  saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10
};
