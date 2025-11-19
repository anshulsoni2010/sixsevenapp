import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../../../../../lib/prisma';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      // User denied consent or error occurred
      console.error('OAuth error:', error);
      let appRedirectUrl = process.env.APP_REDIRECT_URL || 'exp://localhost:8081';

      if (state) {
        try {
          const stateJson = JSON.parse(Buffer.from(state, 'base64').toString());
          if (stateJson.redirectUri) {
            appRedirectUrl = stateJson.redirectUri;
          }
        } catch (e) {
          // Ignore
        }
      }

      return NextResponse.redirect(`${appRedirectUrl}?error=${error}`);
    }

    if (!code) {
      return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 500 });
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    const idToken = tokens.id_token;

    if (!idToken) {
      return NextResponse.json({ error: 'No ID token received' }, { status: 400 });
    }

    // Verify the ID token
    const verifyClient = new OAuth2Client(clientId);
    const ticket = await verifyClient.verifyIdToken({ idToken, audience: clientId });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
    }

    const email = payload.email;
    const googleId = payload.sub;
    const name = payload.name ?? null;
    const picture = payload.picture ?? null;

    // Upsert user in database
    let user = await prisma.user.findUnique({ where: { googleId } });

    if (!user) {
      user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        if (!user.googleId) {
          user = await prisma.user.update({ where: { email }, data: { googleId, name, picture, provider: 'google' } as any });
        }
      } else {
        user = await prisma.user.create({ data: { email, googleId, name, picture, provider: 'google' } as any });
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

    // Redirect to app with token in URL for native clients to extract
    // For web, the cookie is already set
    let appRedirectUrl = process.env.APP_REDIRECT_URL || 'exp://localhost:8081';

    // Try to parse state to get client redirect URI
    if (state) {
      try {
        const stateJson = JSON.parse(Buffer.from(state, 'base64').toString());
        if (stateJson.redirectUri) {
          appRedirectUrl = stateJson.redirectUri;
        }
      } catch (e) {
        // Ignore parse error, use default
        console.log('Could not parse state, using default redirect');
      }
    }

    const redirectUrl = `${appRedirectUrl}?token=${encodeURIComponent(token)}&onboarded=${user.onboarded}`;

    const res = NextResponse.redirect(redirectUrl);
    res.headers.set('Set-Cookie', cookie);
    return res;
  } catch (err) {
    console.error('OAuth callback error', err);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { idToken, accessToken } = body;

    if (!idToken) {
      return NextResponse.json({ error: 'Missing ID token' }, { status: 400 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 500 });
    }

    // Verify the ID token from native Google Sign-In
    const verifyClient = new OAuth2Client(clientId);
    const ticket = await verifyClient.verifyIdToken({ idToken, audience: clientId });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
    }

    const email = payload.email;
    const googleId = payload.sub;
    const name = payload.name ?? null;
    const picture = payload.picture ?? null;

    // Upsert user in database
    let user = await prisma.user.findUnique({ where: { googleId } });

    if (!user) {
      user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        if (!user.googleId) {
          user = await prisma.user.update({ where: { email }, data: { googleId, name, picture, provider: 'google' } as any });
        }
      } else {
        user = await prisma.user.create({ data: { email, googleId, name, picture, provider: 'google' } as any });
      }
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });

    const token = jwt.sign({ userId: user.id, email: user.email }, jwtSecret, { expiresIn: '30d' });

    return NextResponse.json({
      token,
      onboarded: user.onboarded,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      }
    });
  } catch (err) {
    console.error('Native Google Sign-In error', err);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
