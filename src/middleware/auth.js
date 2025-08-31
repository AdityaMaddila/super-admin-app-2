const { verifyToken } = require('../utils/auth');
const { User, Role } = require('../models');

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    const user = await User.findByPk(decoded.userId, {
      include: [Role]
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = {
      ...decoded,
      roles: user.Roles.map(r => r.name)
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function requireSuperAdmin(req, res, next) {
  if (!req.user || !req.user.roles.includes('superadmin')) {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  next();
}

module.exports = {
  requireAuth,
  requireSuperAdmin
};