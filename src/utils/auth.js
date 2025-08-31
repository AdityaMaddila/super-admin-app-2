const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT token
function generateToken(user) {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email,
      roles: user.Roles ? user.Roles.map(r => r.name) : []
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Hashing the password
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// Verify JWT token
function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = {
  generateToken,
  hashPassword,
  comparePassword,
  verifyToken
};