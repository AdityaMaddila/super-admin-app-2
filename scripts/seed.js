// scripts/seed.js
require('dotenv').config();
const { User, Role, initDatabase } = require('../src/models');
const { hashPassword } = require('../src/utils/auth');

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');
    
    // Initialize database
    await initDatabase();

    // Create super admin role
    const [superAdminRole] = await Role.findOrCreate({
      where: { name: 'superadmin' },
      defaults: {
        name: 'superadmin',
        permissions: ['all']
      }
    });

    // Create regular user role
    const [userRole] = await Role.findOrCreate({
      where: { name: 'user' },
      defaults: {
        name: 'user',
        permissions: ['read']
      }
    });

    // Create super admin user
    const hashedPassword = await hashPassword('Test1234!');
    
    const [superAdmin] = await User.findOrCreate({
      where: { email: 'superadmin@example.com' },
      defaults: {
        name: 'Super Admin',
        email: 'superadmin@example.com',
        hashedPassword
      }
    });

    // Assign super admin role
    await superAdmin.addRole(superAdminRole);

    // Create a test regular user
    const testUserPassword = await hashPassword('password123');
    const [testUser] = await User.findOrCreate({
      where: { email: 'user@example.com' },
      defaults: {
        name: 'Test User',
        email: 'user@example.com',
        hashedPassword: testUserPassword
      }
    });

    await testUser.addRole(userRole);

    console.log('✅ Database seeded successfully!');
    console.log('');
    console.log('🔑 Login credentials:');
    console.log('Super Admin: superadmin@example.com / Test1234!');
    console.log('Test User: user@example.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedDatabase();