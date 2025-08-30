// src/routes/superadmin.js
const express = require('express');
const { User, Role, AuditLog } = require('../models');
const { requireAuth, requireSuperAdmin } = require('../middleware/auth');
const { hashPassword } = require('../utils/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Apply auth middleware to all routes
router.use(requireAuth);
router.use(requireSuperAdmin);

// Helper function to log audit events
async function logAudit(actorUserId, action, targetType, targetId, details = {}) {
  await AuditLog.create({
    actorUserId,
    action,
    targetType,
    targetId,
    details
  });
}

// GET /api/v1/superadmin/users - List users with pagination and filters
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;
    const offset = (page - 1) * limit;

    // Build where conditions
    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    // Include roles filter
    const include = [{
      model: Role,
      where: role ? { name: role } : undefined,
      required: !!role,
      through: { as: 'UserRoles' } // Add alias for junction table
    }];

    const { count, rows } = await User.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      users: rows.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.Roles.map(r => r.name),
        UserRoles: user.Roles.map(r => ({ roleId: r.id })), // Add for frontend compatibility
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      })),
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/v1/superadmin/users/:id - Get user details
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{
        model: Role,
        through: { as: 'UserRoles' }
      }]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.Roles.map(r => r.name), // For display
      Roles: user.Roles.map(r => ({ id: r.id, name: r.name })), // For editing
      UserRoles: user.Roles.map(r => ({ roleId: r.id })), // For frontend compatibility
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      activitySummary: {
        loginCount: 0, // You can implement this based on your audit logs
        lastActivity: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST /api/v1/superadmin/users - Create new user
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, roleIds = [] } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      name,
      email,
      hashedPassword
    });

    // Assign roles if provided
    if (roleIds.length > 0) {
      const roles = await Role.findAll({ where: { id: roleIds } });
      await user.addRoles(roles);
    }

    // Log audit event
    await logAudit(req.user.userId, 'CREATE_USER', 'User', user.id, { 
      name, 
      email, 
      assignedRoles: roleIds 
    });

    // Return user without password
    const createdUser = await User.findByPk(user.id, { include: [Role] });
    
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        roles: createdUser.Roles.map(r => r.name)
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT /api/v1/superadmin/users/:id - Update user (FIXED to handle roles)
router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, roleIds } = req.body;
    
    const user = await User.findByPk(req.params.id, {
      include: [Role]
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update basic user info
    await user.update({ name, email });

    // Update roles if provided
    if (roleIds && Array.isArray(roleIds)) {
      // Clear existing roles and set new ones
      await user.setRoles(roleIds);
    }

    // Log audit event
    await logAudit(req.user.userId, 'UPDATE_USER', 'User', user.id, { 
      name, 
      email, 
      roleIds: roleIds || []
    });

    // Return updated user with roles
    const updatedUser = await User.findByPk(user.id, { include: [Role] });

    res.json({
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        roles: updatedUser.Roles.map(r => r.name)
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/v1/superadmin/users/:id - Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't allow deleting yourself
    if (user.id === req.user.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Log audit event before deletion
    await logAudit(req.user.userId, 'DELETE_USER', 'User', user.id, { 
      deletedUserEmail: user.email 
    });

    await user.destroy();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ROLES ENDPOINTS

// GET /api/v1/superadmin/roles - List all roles
router.get('/roles', async (req, res) => {
  try {
    const roles = await Role.findAll({
      order: [['name', 'ASC']]
    });

    res.json({
      roles: roles.map(role => ({
        id: role.id,
        name: role.name,
        permissions: role.permissions,
        createdAt: role.createdAt
      }))
    });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// POST /api/v1/superadmin/roles - Create new role
router.post('/roles', async (req, res) => {
  try {
    const { name, permissions = [] } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Role name is required' });
    }

    const role = await Role.create({ name, permissions });

    await logAudit(req.user.userId, 'CREATE_ROLE', 'Role', role.id, { name, permissions });

    res.status(201).json({
      message: 'Role created successfully',
      role: {
        id: role.id,
        name: role.name,
        permissions: role.permissions
      }
    });
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({ error: 'Failed to create role' });
  }
});

// PUT /api/v1/superadmin/roles/:id - Update role
router.put('/roles/:id', async (req, res) => {
  try {
    const { name, permissions } = req.body;
    
    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    await role.update({ name, permissions });

    await logAudit(req.user.userId, 'UPDATE_ROLE', 'Role', role.id, { name, permissions });

    res.json({
      message: 'Role updated successfully',
      role: {
        id: role.id,
        name: role.name,
        permissions: role.permissions
      }
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// POST /api/v1/superadmin/assign-role - Assign role to user
router.post('/assign-role', async (req, res) => {
  try {
    const { userId, roleId } = req.body;

    if (!userId || !roleId) {
      return res.status(400).json({ error: 'userId and roleId are required' });
    }

    const user = await User.findByPk(userId);
    const role = await Role.findByPk(roleId);

    if (!user || !role) {
      return res.status(404).json({ error: 'User or role not found' });
    }

    await user.addRole(role);

    await logAudit(req.user.userId, 'ASSIGN_ROLE', 'User', userId, { 
      assignedRole: role.name,
      roleId 
    });

    res.json({ message: 'Role assigned successfully' });
  } catch (error) {
    console.error('Assign role error:', error);
    res.status(500).json({ error: 'Failed to assign role' });
  }
});

// AUDIT LOGS ENDPOINTS

// GET /api/v1/superadmin/audit-logs - Get audit logs with filters
router.get('/audit-logs', async (req, res) => {
  try {
    const { page = 1, limit = 20, userId, action, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    // Build where conditions
    const where = {};
    if (userId) where.actorUserId = userId;
    if (action) where.action = action;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'Actor',
        attributes: ['id', 'name', 'email'],
        foreignKey: 'actorUserId'
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      auditLogs: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// ANALYTICS ENDPOINT

// GET /api/v1/superadmin/analytics/summary - Basic analytics
router.get('/analytics/summary', async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [totalUsers, totalRoles, recentLogins] = await Promise.all([
      User.count(),
      Role.count(),
      User.count({
        where: {
          lastLogin: {
            [Op.gte]: sevenDaysAgo
          }
        }
      })
    ]);

    res.json({
      totalUsers,
      totalRoles,
      activeUsersLast7Days: recentLogins,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;