# OAuth Setup - Next Steps

## Backend Configuration

You need to add the following environment variables to `/backend/.env`:

```bash
# Google OAuth Client Secret (obtain from Google Cloud Console)
GOOGLE_CLIENT_SECRET="your-client-secret-here"

# OAuth Redirect URI (where Google sends the user after authentication)
GOOGLE_REDIRECT_URI="http://192.168.43.192:3000/api/auth/google/callback"

# App Deep Link Scheme (where the backend redirects after successful auth)
APP_SCHEME="frontend://"
```

### How to Get GOOGLE_CLIENT_SECRET:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your project (the same one where you created the OAuth Client ID)
3. Go to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID (the one with ID `835051220341-681sotsfbku3vi0n4r23o4cfbvgpp8o5`)
5. Click on it to view details
6. You'll see the **Client Secret** - copy it
7. Add it to your `.env` file

### Update Google Cloud Console Authorized Redirect URIs:

For the OAuth flow to work, you need to add the callback URL to your Google OAuth Client configuration:

1. In Google Cloud Console → **APIs & Services** → **Credentials**
2. Click on your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, add:
   ```
   http://192.168.43.192:3000/api/auth/google/callback
   ```
4. Click **SAVE**

**Note:** For production, you'll need to add your actual backend domain (e.g., `https://yourdomain.com/api/auth/google/callback`)

If testing on iOS Simulator/Android Emulator, you can also add `http://localhost:3000/api/auth/google/callback` as an additional redirect URI.

## Frontend Configuration

The frontend is already configured with:
- Deep link scheme: `frontend://` (defined in `app.json`)
- Backend URL: `http://192.168.43.192:3000` (your local network IP)

**Important:** Make sure your backend is accessible from your mobile device. If testing on a physical device:
- Backend should run on your local network IP (already set: `192.168.43.192`)
- Both devices must be on the same WiFi network

For iOS Simulator/Android Emulator, use `http://localhost:3000` instead.

## Testing the OAuth Flow

Once you've added the environment variables:

1. Start the backend:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npx expo start
   ```

3. Navigate to the Alpha Confirm screen in the app
4. Click "Let's be Alpha" button
5. You should see:
   - Browser opens to Google OAuth consent screen
   - After signing in, redirected back to the app
   - User created/logged in, navigated to appropriate screen

## OAuth Flow Summary

1. User clicks "Let's be Alpha" → `handleGooglePress()` called
2. Opens `http://192.168.43.192:3000/api/auth/google/initiate` in browser
3. Backend redirects to Google OAuth consent screen
4. User signs in and grants permissions
5. Google redirects to `http://localhost:3000/api/auth/google/callback?code=...`
6. Backend exchanges code for tokens, verifies identity, creates/finds user
7. Backend creates JWT session token
8. Backend redirects to `frontend://?token=...&onboarded=...`
9. App receives deep link, extracts token, stores in SecureStore
10. App navigates to tabs (if onboarded) or continues onboarding (if new user)

## Troubleshooting

- **"Cannot open page"**: Check that deep link scheme matches in `app.json` and backend `APP_SCHEME`
- **"Redirect URI mismatch"**: Verify `GOOGLE_REDIRECT_URI` in `.env` matches what's configured in Google Cloud Console
- **Backend not reachable**: Ensure mobile device is on same WiFi and backend IP is correct in `frontend/app.json`
