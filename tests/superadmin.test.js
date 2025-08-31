const request = require('supertest');
const app = require('../src/app');
const { User, Role } = require('../src/models');
const { hashPassword } = require('../src/utils/auth');

describe('Super Admin API', () => {
  let superAdminToken;
  let testUserId;

  beforeAll(async () => {
    const hashedPassword = await hashPassword('Test1234!');
    const superAdmin = await User.create({
      name: 'Test Admin',
      email: 'testadmin@example.com',
      hashedPassword
    });

    const superAdminRole = await Role.create({
      name: 'superadmin',
      permissions: ['all']
    });

    await superAdmin.addRole(superAdminRole);

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'testadmin@example.com',
        password: 'Test1234!'
      });

    superAdminToken = loginResponse.body.token;
  });

  describe('User Management', () => {
    test('should create a new user', async () => {
      const response = await request(app)
        .post('/api/v1/superadmin/users')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: 'Test User',
          email: 'testuser@example.com',
          password: 'Password123!',
          roleIds: []
        });

      expect(response.status).toBe(201);
      expect(response.body.user.name).toBe('Test User');
      expect(response.body.user.email).toBe('testuser@example.com');
      testUserId = response.body.user.id;
    });

    test('should get users list', async () => {
      const response = await request(app)
        .get('/api/v1/superadmin/users')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.users).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
    });

    test('should update user details', async () => {
      const response = await request(app)
        .put(`/api/v1/superadmin/users/${testUserId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: 'Updated User',
          email: 'updated@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.user.name).toBe('Updated User');
    });
  });

  describe('Role Management', () => {
    test('should create a new role', async () => {
      const response = await request(app)
        .post('/api/v1/superadmin/roles')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: 'test-role',
          permissions: ['read', 'write']
        });

      expect(response.status).toBe(201);
      expect(response.body.role.name).toBe('test-role');
    });

    test('should get roles list', async () => {
      const response = await request(app)
        .get('/api/v1/superadmin/roles')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.roles).toBeInstanceOf(Array);
    });
  });

  describe('Analytics', () => {
    test('should get analytics summary', async () => {
      const response = await request(app)
        .get('/api/v1/superadmin/analytics/summary')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.totalUsers).toBeDefined();
      expect(response.body.totalRoles).toBeDefined();
      expect(response.body.activeUsersLast7Days).toBeDefined();
    });
  });

  afterAll(async () => {
    // Cleanup
    await User.destroy({ where: { email: ['testadmin@example.com', 'updated@example.com'] } });
    await Role.destroy({ where: { name: ['test-role'] } });
  });
});