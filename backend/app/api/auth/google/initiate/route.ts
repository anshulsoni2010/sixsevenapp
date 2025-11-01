import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(req: Request) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 500 });
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

    // Generate state parameter (random string to prevent CSRF)
    const state = Math.random().toString(36).substring(2, 15);

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
