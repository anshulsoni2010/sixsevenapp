# Six Seven API Documentation

## Overview

The Six Seven API provides backend services for the Six Seven mobile application, which transforms messages into Gen Alpha slang.

## Getting Started

### Base URL
- **Development**: `http://localhost:3000`
- **Production**: `https://your-production-url.com`

### Authentication
All API endpoints (except webhooks) require JWT authentication via Bearer token:

```
Authorization: Bearer <your-jwt-token>
```

## API Documentation

The complete API documentation is available via Swagger UI:

### Access Swagger Documentation
1. Start the backend server: `npm run dev`
2. Visit: `http://localhost:3000/api/docs`

### Generate Updated Documentation
To regenerate the swagger specification after making changes:

```bash
npm run generate-swagger
```

This will update `public/swagger.json` with the latest API documentation.

## Key Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth authentication

### User Management
- `GET /api/user/me` - Get user profile
- `PATCH /api/user/me` - Update user profile
- `DELETE /api/user/me` - Delete user account

### Subscriptions
- `POST /api/stripe/create-checkout` - Create subscription checkout
- `POST /api/stripe/create-portal-session` - Access customer portal
- `POST /api/stripe/webhook` - Stripe webhook handler

## Development

### Adding New Endpoints
1. Create your API route in `app/api/`
2. Add JSDoc swagger comments to document the endpoint
3. Run `npm run generate-swagger` to update documentation
4. Test the endpoint via Swagger UI

### Swagger JSDoc Format
```javascript
/**
 * @swagger
 * /api/your-endpoint:
 *   method:
 *     summary: Brief description
 *     description: Detailed description
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success response
 */
```

## Testing

Use the Swagger UI to test endpoints interactively:
1. Navigate to `/api/docs`
2. Click on any endpoint
3. Click "Try it out"
4. Enter required parameters
5. Click "Execute"

## Support

For API support, contact: support@sixseven.app