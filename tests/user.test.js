const request  = require('supertest');
const mongoose = require('mongoose');
const app      = require('../app');
const User     = require('../models/User');
const Watchlist = require('../models/Watchlist');

// =====================
// Shared auth cookie
// across all tests
// =====================
let sharedCookie;

// =====================
// Test Setup & Teardown
// =====================
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST || process.env.MONGO_URI);

  // Clean up any leftover test user or watchlists
  await User.deleteMany({ email: 'usertest@example.com' });
  await Watchlist.deleteMany({});

  // Register test user
  await request(app)
    .post('/api/auth/register')
    .send({
      name:            'User Test',
      email:           'usertest@example.com',
      password:        'password123',
      confirmPassword: 'password123',
    });

  // Login and store cookie for all tests
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email:    'usertest@example.com',
      password: 'password123',
    });

  sharedCookie = loginResponse.headers['set-cookie'];
});

afterAll(async () => {
  await User.deleteMany({ email: 'usertest@example.com' });
  await Watchlist.deleteMany({});
  await mongoose.connection.close();
});

// =====================
// USER PROFILE TESTS
// =====================
describe('User Profile Integration', () => {

  describe('GET /profile', () => {
    test('should redirect to login if unauthenticated', async () => {
      const res = await request(app).get('/profile');
      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/login');
    });

    test('should render profile page for authenticated user', async () => {
      const res = await request(app)
        .get('/profile')
        .set('Cookie', sharedCookie);

      expect(res.status).toBe(200);
      expect(res.text).toContain('Edit Profile');
    });
  });

  describe('POST /api/users/profile', () => {
    test('should render page with Joi validation error for invalid name', async () => {
      const res = await request(app)
        .post('/api/users/profile')
        .set('Cookie', sharedCookie)
        .send({ name: 'a' }); // Name too short

      expect(res.status).toBe(200);
      expect(res.text).toContain('Name must be at least 2 characters');
    });

    test('should successfully update user profile name', async () => {
      const res = await request(app)
        .post('/api/users/profile')
        .set('Cookie', sharedCookie)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.text).toContain('Profile updated successfully!');

      // Check DB values
      const user = await User.findOne({ email: 'usertest@example.com' });
      expect(user.name).toBe('Updated Name');
    });
  });

});

// =====================
// USER WATCHLIST TESTS
// =====================
describe('User Watchlist Integration', () => {

  describe('GET /watchlist', () => {
    test('should redirect to login if unauthenticated', async () => {
      const res = await request(app).get('/watchlist');
      expect(res.status).toBe(302);
    });

    test('should render watchlist page for authenticated user', async () => {
      const res = await request(app)
        .get('/watchlist')
        .set('Cookie', sharedCookie);

      expect(res.status).toBe(200);
      expect(res.text).toContain('My List');
    });
  });

  describe('POST & DELETE /api/users/watchlist', () => {
    test('should successfully add a movie to watchlist', async () => {
      const res = await request(app)
        .post('/api/users/watchlist')
        .set('Cookie', sharedCookie)
        .send({
          tmdbId: 550,
          title:  'Fight Club',
          poster: '/fightclub-poster.jpg',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Movie added to watchlist');

      const testUser = await User.findOne({ email: 'usertest@example.com' });
      const watchlist = await Watchlist.findOne({ user: testUser._id });
      expect(watchlist.movies).toHaveLength(1);
      expect(watchlist.movies[0].title).toBe('Fight Club');
    });

    test('should return 200 if trying to add duplicate movie', async () => {
      const res = await request(app)
        .post('/api/users/watchlist')
        .set('Cookie', sharedCookie)
        .send({
          tmdbId: 550,
          title:  'Fight Club',
          poster: '/fightclub-poster.jpg',
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Movie already in watchlist');
    });

    test('should remove movie from watchlist via DELETE request', async () => {
      const res = await request(app)
        .delete('/api/users/watchlist/550')
        .set('Cookie', sharedCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const testUser = await User.findOne({ email: 'usertest@example.com' });
      const watchlist = await Watchlist.findOne({ user: testUser._id });
      expect(watchlist.movies).toHaveLength(0);
    });
  });

});
