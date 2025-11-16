const swaggerJsdoc = require('swagger-jsdoc');
const fs = require('fs');
const path = require('path');

// Determine server URL dynamically
function getServerUrl() {
  // Check if running on Vercel
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Check for custom production URL
  if (process.env.NODE_ENV === 'production' && process.env.PRODUCTION_URL) {
    return process.env.PRODUCTION_URL;
  }

  // Default to localhost for development
  return 'http://localhost:3000';
}

function getServerDescription() {
  if (process.env.VERCEL_URL) {
    return 'Vercel Production Server';
  }

  if (process.env.NODE_ENV === 'production') {
    return 'Production Server';
  }

  return 'Development Server';
}

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Six Seven API',
      version: '1.0.0',
      description: 'Backend API for Six Seven - Talk the Alpha, Walk the Alpha',
      contact: {
        name: 'Six Seven Support',
        email: 'support@sixseven.app',
      },
    },
    servers: [
      {
        url: getServerUrl(),
        description: getServerDescription(),
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            picture: { type: 'string', format: 'uri' },
            subscribed: { type: 'boolean' },
            subscriptionPlan: { type: 'string', enum: ['monthly', 'yearly'] },
            subscriptionStatus: { type: 'string' },
            subscriptionEndsAt: { type: 'string', format: 'date-time' },
            onboarded: { type: 'boolean' },
            age: { type: 'integer', minimum: 13, maximum: 120 },
            gender: { type: 'string', enum: ['male', 'female', 'other', 'prefer-not-to-say'] },
            alphaLevel: { type: 'string' },
            notifications: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./app/api/**/*.ts'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

// Write the swagger spec to a file
fs.writeFileSync(
  path.join(__dirname, '..', 'public', 'swagger.json'),
  JSON.stringify(specs, null, 2)
);

console.log('Swagger specification generated successfully!');
console.log('Access the API docs at: http://localhost:3000/api/docs');