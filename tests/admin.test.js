const request  = require('supertest');
const mongoose = require('mongoose');
const app      = require('../app');
const User     = require('../models/User');
const Watchlist = require('../models/Watchlist');

// Increase Jest timeout for registration operations
jest.setTimeout(30000);

// =====================
// Shared auth cookies
// across tests
// =====================
let regularCookie;
let adminCookie;
let regularUserId;
let adminUserId;

// =====================
// Test Setup & Teardown
// =====================
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST || process.env.MONGO_URI);

  // Clean up leftover test users
  await User.deleteMany({
    email: { $in: ['admin@example.com', 'regular@example.com'] },
  });

  // 1. Register regular user
  await request(app)
    .post('/api/auth/register')
    .send({
      name:            'Regular User',
      email:           'regular@example.com',
      password:        'password123',
      confirmPassword: 'password123',
    });

  const regularLogin = await request(app)
    .post('/api/auth/login')
    .send({
      email:    'regular@example.com',
      password: 'password123',
    });

  regularCookie = regularLogin.headers['set-cookie'];
  const regularUser = await User.findOne({ email: 'regular@example.com' });
  regularUserId = regularUser._id.toString();

  // 2. Register admin user
  await request(app)
    .post('/api/auth/register')
    .send({
      name:            'Admin User',
      email:           'admin@example.com',
      password:        'password123',
      confirmPassword: 'password123',
    });

  // Promote user to admin role in database
  await User.findOneAndUpdate(
    { email: 'admin@example.com' },
    { role: 'admin' }
  );

  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({
      email:    'admin@example.com',
      password: 'password123',
    });

  adminCookie = adminLogin.headers['set-cookie'];
  const adminUser = await User.findOne({ email: 'admin@example.com' });
  adminUserId = adminUser._id.toString();
});

afterAll(async () => {
  await User.deleteMany({
    email: { $in: ['admin@example.com', 'regular@example.com'] },
  });
  await mongoose.connection.close();
});

// =====================
// ADMIN DASHBOARD GUARDS
// =====================
describe('GET /admin', () => {

  test('should redirect to login if unauthenticated', async () => {
    const res = await request(app).get('/admin');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/login');
  });

  test('should return 403 Forbidden for regular users', async () => {
    const res = await request(app)
      .get('/admin')
      .set('Cookie', regularCookie);

    expect(res.status).toBe(403);
    expect(res.text).toContain('permission');
  });

  test('should return 200 OK for admin users and render stats', async () => {
    const res = await request(app)
      .get('/admin')
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.text).toContain('Admin Dashboard');
    expect(res.text).toContain('Total Registrations');
  });

});

// =====================
// USER LISTINGS GUARDS
// =====================
describe('GET /admin/users', () => {

  test('should return 403 Forbidden for regular users', async () => {
    const res = await request(app)
      .get('/admin/users')
      .set('Cookie', regularCookie);

    expect(res.status).toBe(403);
  });

  test('should return 200 OK for admin users and list users', async () => {
    const res = await request(app)
      .get('/admin/users')
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.text).toContain('User Management');
  });

});

// =====================
// ACCOUNT DELETION TESTS
// =====================
describe('DELETE /api/admin/users/:id', () => {

  test('should prevent unauthenticated/regular users from deleting accounts', async () => {
    const res = await request(app)
      .delete(`/api/admin/users/${regularUserId}`)
      .set('Cookie', regularCookie);

    expect(res.status).toBe(403);
  });

  test('should prevent admin from self-deletion', async () => {
    const res = await request(app)
      .delete(`/api/admin/users/${adminUserId}`)
      .set('Cookie', adminCookie);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('cannot delete your own');
  });

  test('should allow admin to delete user account', async () => {
    const res = await request(app)
      .delete(`/api/admin/users/${regularUserId}`)
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const deletedUser = await User.findById(regularUserId);
    expect(deletedUser).toBeNull();
  });

});
