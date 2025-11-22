import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * @swagger
 * /api/auth/apple/initiate:
 *   get:
 *     summary: Initiate Apple OAuth
 *     description: Redirect to Apple OAuth consent screen for authentication
 *     responses:
 *       302:
 *         description: Redirect to Apple OAuth consent screen
 *       500:
 *         description: Failed to initiate Apple OAuth
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export async function GET(req: Request) {
  try {
    const clientId = process.env.APPLE_CLIENT_ID;
    const redirectUri = process.env.APPLE_REDIRECT_URI || 'http://localhost:3000/api/auth/apple/callback';

    if (!clientId) {
      return NextResponse.json({ error: 'Apple OAuth not configured' }, { status: 500 });
    }

    // Generate state parameter for CSRF protection
    const state = crypto.randomBytes(16).toString('hex');

    // Apple OAuth authorization URL
    const authUrl = new URL('https://appleid.apple.com/auth/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code id_token');
    authUrl.searchParams.set('response_mode', 'form_post');
    authUrl.searchParams.set('scope', 'name email');
    authUrl.searchParams.set('state', state);

    // Redirect browser to Apple OAuth consent screen
    return NextResponse.redirect(authUrl.toString());
  } catch (err) {
    console.error('Apple OAuth initiate error', err);
    return NextResponse.json({ error: 'Failed to initiate Apple OAuth' }, { status: 500 });
  }
}
