const request  = require('supertest');
const mongoose = require('mongoose');
const app      = require('../app');
const User     = require('../models/User');

// Increase Jest timeout for registration/login operations (bcrypt and DB latency)
jest.setTimeout(30000);

// =====================
// Test Setup & Teardown
// =====================
beforeAll(async () => {
  // Connect to a separate test database
  await mongoose.connect(process.env.MONGO_URI_TEST || process.env.MONGO_URI);
});

afterAll(async () => {
  // Clean up test users and close connection
  await User.deleteMany({ email: /test/i });
  await mongoose.connection.close();
});

afterEach(async () => {
  // Clean up after each test
  await User.deleteMany({ email: /test/i });
});

// =====================
// Test Data
// =====================
const validUser = {
  name:            'Test User',
  email:           'test@example.com',
  password:        'password123',
  confirmPassword: 'password123',
};

const invalidUser = {
  name:            'T',        // Too short
  email:           'not-valid', // Invalid email
  password:        '123',       // Too short
  confirmPassword: '456',       // Doesn't match
};

// =====================
// REGISTER TESTS
// =====================
describe('POST /api/auth/register', () => {

  test('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(validUser);

    // Should redirect to /browse after successful registration
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/browse');
  });

  test('should reject registration with invalid data', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(invalidUser);

    expect(response.status).toBe(400);
  });

  test('should reject registration with duplicate email', async () => {
    // Register first user
    await request(app)
      .post('/api/auth/register')
      .send(validUser);

    // Try to register again with same email
    const response = await request(app)
      .post('/api/auth/register')
      .send(validUser);

    expect(response.status).toBe(400);
  });

  test('should reject registration with missing fields', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com' }); // Missing name, password

    expect(response.status).toBe(400);
  });

  test('should reject registration when passwords do not match', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name:            'Test User',
        email:           'test@example.com',
        password:        'password123',
        confirmPassword: 'differentpassword',
      });

    expect(response.status).toBe(400);
  });

});

// =====================
// LOGIN TESTS
// =====================
describe('POST /api/auth/login', () => {

  beforeEach(async () => {
    // Create a user before each login test
    await request(app)
      .post('/api/auth/register')
      .send(validUser);
  });

  test('should login successfully with correct credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email:    validUser.email,
        password: validUser.password,
      });

    // Should redirect after successful login
    expect(response.status).toBe(302);
    // Should set auth cookie
    expect(response.headers['set-cookie']).toBeDefined();
  });

  test('should reject login with wrong password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email:    validUser.email,
        password: 'wrongpassword',
      });

    expect(response.status).toBe(401);
  });

  test('should reject login with unregistered email', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email:    'notregistered@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(401);
  });

  test('should reject login with missing fields', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email }); // Missing password

    expect(response.status).toBe(400);
  });

  test('should reject login with invalid email format', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email:    'not-an-email',
        password: 'password123',
      });

    expect(response.status).toBe(400);
  });

});

// =====================
// LOGOUT TESTS
// =====================
describe('GET /logout', () => {

  test('should redirect to login if not authenticated', async () => {
    const response = await request(app)
      .get('/logout');

    // Should redirect to login since no token
    expect(response.status).toBe(302);
  });

  test('should logout successfully when authenticated', async () => {
    // First register and get cookie
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(validUser);

    const cookie = registerResponse.headers['set-cookie'];

    // Now logout with the cookie
    const response = await request(app)
      .get('/logout')
      .set('Cookie', cookie);

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/login');
  });

});

// =====================
// FORGOT PASSWORD TESTS
// =====================
describe('POST /api/auth/forgot-password', () => {

  beforeEach(async () => {
    await request(app)
      .post('/api/auth/register')
      .send(validUser);
  });

  test('should send reset email for valid registered email', async () => {
    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: validUser.email });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('should reject forgot password with unregistered email', async () => {
    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'notregistered@example.com' });

    expect(response.status).toBe(404);
  });

  test('should reject forgot password with invalid email format', async () => {
    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'not-an-email' });

    expect(response.status).toBe(400);
  });

});

// =====================
// PAGE RENDER TESTS
// =====================
describe('GET Auth Pages', () => {

  test('should render login page', async () => {
    const response = await request(app).get('/login');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Sign In');
  });

  test('should render register page', async () => {
    const response = await request(app).get('/register');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Sign Up');
  });

  test('should render forgot password page', async () => {
    const response = await request(app).get('/forgot-password');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Forgot Password');
  });

});