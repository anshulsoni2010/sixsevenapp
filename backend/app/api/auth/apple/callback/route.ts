import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../../../lib/prisma';
import { serialize } from 'cookie';

// Apple uses POST for the callback
/**
 * @swagger
 * /api/auth/apple/callback:
 *   post:
 *     summary: Apple OAuth callback
 *     description: Handle Apple OAuth callback for authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: Authorization code from Apple
 *               id_token:
 *                 type: string
 *                 description: ID token from Apple
 *               user:
 *                 type: string
 *                 description: User data from Apple (JSON string, first sign-in only)
 *               error:
 *                 type: string
 *                 description: Error from Apple OAuth
 *     responses:
 *       302:
 *         description: Redirect to app with authentication token
 *       400:
 *         description: No ID token received or email required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   get:
 *     summary: Apple OAuth callback (GET)
 *     description: Handle Apple OAuth callback via GET (not recommended)
 *     responses:
 *       405:
 *         description: Use POST method for Apple callback
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const code = formData.get('code') as string;
    const idToken = formData.get('id_token') as string;
    const user = formData.get('user'); // Apple sends user data only on first sign-in
    const error = formData.get('error') as string;

    if (error) {
      console.error('Apple OAuth error:', error);
      const appRedirectUrl = process.env.APP_REDIRECT_URL || 'exp://localhost:8081';
      return NextResponse.redirect(`${appRedirectUrl}?error=${error}`);
    }

    if (!idToken) {
      return NextResponse.json({ error: 'No ID token received' }, { status: 400 });
    }

    // Decode the Apple ID token (in production, you should verify the signature)
    const decoded: any = jwt.decode(idToken);
    
    if (!decoded || !decoded.sub) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const appleId = decoded.sub;
    const email = decoded.email;
    
    // Parse user data if provided (only on first sign-in)
    let name = null;
    if (user) {
      try {
        const userData = JSON.parse(user as string);
        if (userData.name) {
          name = `${userData.name.firstName || ''} ${userData.name.lastName || ''}`.trim();
        }
      } catch (e) {
        console.error('Error parsing Apple user data:', e);
      }
    }

    // Upsert user in database
    let dbUser = await prisma.user.findUnique({ where: { appleId } });

    if (!dbUser && email) {
      dbUser = await prisma.user.findUnique({ where: { email } });
      if (dbUser) {
        // Link Apple ID to existing user
        if (!dbUser.appleId) {
          dbUser = await prisma.user.update({
            where: { email },
            data: { appleId, provider: 'apple', name: name || dbUser.name },
          });
        }
      } else {
        // Create new user
        dbUser = await prisma.user.create({
          data: { 
            email, 
            appleId, 
            name,
            provider: 'apple'
          },
        });
      }
    } else if (!dbUser) {
      // No email provided and no existing user
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });

    const token = jwt.sign({ userId: dbUser.id, email: dbUser.email }, jwtSecret, { expiresIn: '30d' });

    const cookie = serialize('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    // Redirect to app with token in URL for native clients to extract
    const appRedirectUrl = process.env.APP_REDIRECT_URL || 'exp://localhost:8081';
    const redirectUrl = `${appRedirectUrl}?token=${encodeURIComponent(token)}&onboarded=${dbUser.onboarded}`;

    const res = NextResponse.redirect(redirectUrl);
    res.headers.set('Set-Cookie', cookie);
    return res;
  } catch (err) {
    console.error('Apple OAuth callback error', err);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

// Also handle GET requests (in case the response_mode needs to be 'query')
export async function GET(req: Request) {
  return NextResponse.json({ error: 'Use POST method for Apple callback' }, { status: 405 });
}
