/**
 * Six Seven API - Authentication Endpoints
 *
 * IMPORTANT: When modifying this file, remember to:
 * 1. Update the JSDoc swagger comments above each endpoint
 * 2. Run `npm run generate-swagger` to update documentation
 * 3. Test changes in Swagger UI at /api/docs
 *
 * See API_WORKFLOW.md for complete development guidelines.
 */

import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../../../../lib/prisma';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Google OAuth authentication
 *     description: Authenticate user with Google OAuth and return JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: Google OAuth ID token
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     picture:
 *                       type: string
 *                     onboarded:
 *                       type: boolean
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; Path=/; HttpOnly; Max-Age=2592000
 *       400:
 *         description: Missing or invalid idToken
 *       401:
 *         description: Invalid token payload
 *       500:
 *         description: Server error
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { idToken } = body;
    if (!idToken) {
      return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
    }

    const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
    }

    const email = payload.email;
    const googleId = payload.sub;
    const name = payload.name ?? null;
    const picture = payload.picture ?? null;

    // Try to find by googleId first
    let user = await prisma.user.findUnique({ where: { googleId } });

    if (!user) {
      // Try find by email
      user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        // attach googleId if missing
        if (!user.googleId) {
          user = await prisma.user.update({ where: { email }, data: { googleId, name, picture } });
        }
      } else {
        // create new user
        user = await prisma.user.create({ data: { email, googleId, name, picture } });
      }
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });

    const token = jwt.sign({ userId: user.id, email: user.email }, jwtSecret, { expiresIn: '30d' });

    const cookie = serialize('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

  const res = NextResponse.json({ token, user: { id: user.id, email: user.email, name: user.name, picture: user.picture }, onboarded: user.onboarded });
  res.headers.set('Set-Cookie', cookie);
  return res;
  } catch (err) {
    console.error('Google auth error', err);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
