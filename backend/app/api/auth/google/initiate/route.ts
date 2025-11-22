import { NextResponse } from 'next/server';
import { google } from 'googleapis';

/**
 * @swagger
 * /api/auth/google/initiate:
 *   get:
 *     summary: Initiate Google OAuth
 *     description: Redirect to Google OAuth consent screen for authentication
 *     parameters:
 *       - in: query
 *         name: redirect_uri
 *         schema:
 *           type: string
 *           format: uri
 *         description: URI to redirect back to after authentication
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth consent screen
 *       500:
 *         description: Failed to initiate OAuth
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export async function GET(req: Request) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 500 });
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

    const url = new URL(req.url);
    const clientRedirectUri = url.searchParams.get('redirect_uri');

    // Generate state parameter with redirect URI
    const stateData = {
      random: Math.random().toString(36).substring(2, 15),
      redirectUri: clientRedirectUri
    };
    const state = Buffer.from(JSON.stringify(stateData)).toString('base64');

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['profile', 'email'],
      state,
      prompt: 'select_account',
    });

    // Redirect browser to Google OAuth consent screen
    return NextResponse.redirect(authUrl);
  } catch (err) {
    console.error('OAuth initiate error', err);
    return NextResponse.json({ error: 'Failed to initiate OAuth' }, { status: 500 });
  }
}
