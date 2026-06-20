const swaggerJsdoc = require('swagger-jsdoc');

// =====================
// Swagger Definition
// =====================
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title:       'Netflix Clone API',
    version:     '1.0.0',
    description: 'API documentation for the Netflix Clone project built with Node.js, Express.js, MongoDB Atlas, and TMDB API.',
    contact: {
      name:  'TechCognify',
      email: 'info@techcognify.com',
    },
  },
  servers: [
    {
      url:         'http://localhost:3000',
      description: 'Local Development Server',
    },
    {
      url:         'https://movie-verse-eight-gilt.vercel.app',
      description: 'Production Server (Vercel)',
    },
  ],

  // =====================
  // Security Schemes
  // =====================
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in:   'cookie',
        name: 'authToken',
        description: 'JWT token stored in HTTP-only cookie. Login first to authenticate.',
      },
    },

    // =====================
    // Reusable Schemas
    // =====================
    schemas: {

      // Auth Schemas
      RegisterInput: {
        type: 'object',
        required: ['name', 'email', 'password', 'confirmPassword'],
        properties: {
          name:            { type: 'string', example: 'John Doe', minLength: 2, maxLength: 50 },
          email:           { type: 'string', format: 'email', example: 'john@example.com' },
          password:        { type: 'string', minLength: 6, example: 'password123' },
          confirmPassword: { type: 'string', minLength: 6, example: 'password123' },
        },
      },

      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email:    { type: 'string', format: 'email', example: 'john@example.com' },
          password: { type: 'string', example: 'password123' },
        },
      },

      ForgotPasswordInput: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email', example: 'john@example.com' },
        },
      },

      ResetPasswordInput: {
        type: 'object',
        required: ['password', 'confirmPassword'],
        properties: {
          password:        { type: 'string', minLength: 6, example: 'newpassword123' },
          confirmPassword: { type: 'string', minLength: 6, example: 'newpassword123' },
        },
      },

      UpdateProfileInput: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 50, example: 'Jane Doe' },
        },
      },

      AddToWatchlistInput: {
        type: 'object',
        required: ['tmdbId', 'title', 'poster'],
        properties: {
          tmdbId: { type: 'number', example: 550 },
          title:  { type: 'string', example: 'Fight Club' },
          poster: { type: 'string', example: '/poster-path.jpg' },
        },
      },

      // Response Schemas
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation completed successfully' },
        },
      },

      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Something went wrong' },
        },
      },

      UserResponse: {
        type: 'object',
        properties: {
          id:     { type: 'string', example: '64abc123def456' },
          name:   { type: 'string', example: 'John Doe' },
          email:  { type: 'string', example: 'john@example.com' },
          role:   { type: 'string', enum: ['user', 'admin'], example: 'user' },
          avatar: { type: 'string', example: '/images/default-avatar.png' },
        },
      },
    },
  },

  // =====================
  // Global Security
  // =====================
  security: [{ cookieAuth: [] }],

  // =====================
  // Tags (Groups)
  // =====================
  tags: [
    { name: 'Authentication', description: 'User registration, login, logout and password reset' },
    { name: 'Movies',         description: 'Browse, search, filter and movie detail pages' },
    { name: 'User',           description: 'User profile and watchlist management' },
    { name: 'Admin',          description: 'Admin dashboard and user management (Admin only)' },
  ],
};

// =====================
// Swagger Options
// =====================
const swaggerOptions = {
  swaggerDefinition,
  apis: [
    './routes/authRoutes.js',
    './routes/movieRoutes.js',
    './routes/userRoutes.js',
    './routes/adminRoutes.js',
  ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;