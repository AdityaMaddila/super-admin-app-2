// src/models/index.js
const { Sequelize, DataTypes } = require('sequelize');

// Initialize SQLite database
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DB_PATH || './database.sqlite',
  logging: false // Set to console.log to see SQL queries
});

// User Model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  hashedPassword: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastLogin: {
    type: DataTypes.DATE
  }
});

// Role Model
const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  permissions: {
    type: DataTypes.JSON,
    defaultValue: []
  }
});

// Audit Log Model
const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  actorUserId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  targetType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  targetId: {
    type: DataTypes.INTEGER
  },
  details: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
});

// Set up associations (relationships)
User.belongsToMany(Role, { through: 'UserRoles' });
Role.belongsToMany(User, { through: 'UserRoles' });

// Audit log associations
AuditLog.belongsTo(User, { foreignKey: 'actorUserId', as: 'Actor' });

// Database connection function
async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('📦 Database connected successfully');
    
    // Sync models (creates tables if they don't exist)
    await sequelize.sync();
    console.log('📋 Database tables synced');
    
    return sequelize;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

module.exports = {
  sequelize,
  User,
  Role,
  AuditLog,
  initDatabase
};