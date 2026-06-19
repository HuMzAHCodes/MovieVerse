const request  = require('supertest');
const mongoose = require('mongoose');
const app      = require('../app');
const User     = require('../models/User');

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

  // Clean up any leftover test user
  await User.deleteMany({ email: 'movietest@example.com' });

  // Register test user
  await request(app)
    .post('/api/auth/register')
    .send({
      name:            'Movie Test User',
      email:           'movietest@example.com',
      password:        'password123',
      confirmPassword: 'password123',
    });

  // Login and store cookie for all tests
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email:    'movietest@example.com',
      password: 'password123',
    });

  sharedCookie = loginResponse.headers['set-cookie'];
});

afterAll(async () => {
  await User.deleteMany({ email: 'movietest@example.com' });
  await mongoose.connection.close();
});

// =====================
// BROWSE PAGE TESTS
// =====================
describe('GET /browse', () => {

  test('should redirect to login if not authenticated', async () => {
    const response = await request(app).get('/browse');
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/login');
  });

  test('should render browse page for authenticated user', async () => {
    const response = await request(app)
      .get('/browse')
      .set('Cookie', sharedCookie);

    expect(response.status).toBe(200);
    expect(response.text).toContain('Trending');
  }, 15000);

});

// =====================
// MOVIE DETAIL TESTS
// =====================
describe('GET /movie/:tmdbId', () => {

  test('should redirect to login if not authenticated', async () => {
    const response = await request(app).get('/movie/550');
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/login');
  });

  test('should render movie detail page for valid movie ID', async () => {
    const response = await request(app)
      .get('/movie/550')
      .set('Cookie', sharedCookie);

    expect(response.status).toBe(200);
    expect(response.text).toContain('Fight Club');
  }, 15000);

  test('should return 400 for invalid movie ID', async () => {
    const response = await request(app)
      .get('/movie/invalid-id')
      .set('Cookie', sharedCookie);

    expect(response.status).toBe(400);
  });

  test('should return 404 for non-existent movie ID', async () => {
    const response = await request(app)
      .get('/movie/999999999')
      .set('Cookie', sharedCookie);

    expect(response.status).toBe(404);
  }, 15000);

});

// =====================
// SEARCH PAGE TESTS
// =====================
describe('GET /search', () => {

  test('should redirect to login if not authenticated', async () => {
    const response = await request(app).get('/search');
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/login');
  });

  test('should render search page with empty query', async () => {
    const response = await request(app)
      .get('/search')
      .set('Cookie', sharedCookie);

    expect(response.status).toBe(200);
    expect(response.text).toContain('Search');
  });

  test('should return results for valid search query', async () => {
    const response = await request(app)
      .get('/search?q=batman')
      .set('Cookie', sharedCookie);

    expect(response.status).toBe(200);
    expect(response.text).toContain('batman');
  }, 15000);

  test('should return empty results for gibberish query', async () => {
    const response = await request(app)
      .get('/search?q=xyzxyzxyzxyz123456')
      .set('Cookie', sharedCookie);

    expect(response.status).toBe(200);
    expect(response.text).toContain('No results found');
  }, 15000);

  test('should handle pagination correctly', async () => {
    const response = await request(app)
      .get('/search?q=batman&page=2')
      .set('Cookie', sharedCookie);

    expect(response.status).toBe(200);
  }, 15000);

});

// =====================
// GENRE PAGE TESTS
// =====================
describe('GET /genre/:genreId', () => {

  test('should redirect to login if not authenticated', async () => {
    const response = await request(app).get('/genre/28');
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/login');
  });

  test('should render genre page for valid genre ID', async () => {
    const response = await request(app)
      .get('/genre/28')
      .set('Cookie', sharedCookie);

    expect(response.status).toBe(200);
    expect(response.text).toContain('Action');
  }, 15000);

  test('should return 400 for invalid genre ID', async () => {
    const response = await request(app)
      .get('/genre/invalid-id')
      .set('Cookie', sharedCookie);

    expect(response.status).toBe(400);
  });

  test('should handle genre pagination correctly', async () => {
    const response = await request(app)
      .get('/genre/28?page=2')
      .set('Cookie', sharedCookie);

    expect(response.status).toBe(200);
  }, 15000);

});