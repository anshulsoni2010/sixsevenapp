# Server-Side OAuth Implementation Summary

## What Was Implemented

Successfully migrated from client-side OAuth (expo-auth-session) to a complete **server-side OAuth code exchange flow** where the backend handles all Google OAuth redirects and callbacks.

## Architecture Overview

### Backend (Next.js)

Created three new API routes for OAuth:

#### 1. `/api/auth/google/initiate` (GET)
- **Purpose:** OAuth entry point that redirects browser to Google's consent screen
- **Flow:**
  - Creates OAuth2Client with credentials from environment variables
  - Generates authorization URL with `state` parameter for CSRF protection
  - Redirects user to Google OAuth consent screen
- **File:** `/backend/app/api/auth/google/initiate/route.ts`

#### 2. `/api/auth/google/callback` (GET)
- **Purpose:** OAuth callback that receives authorization code from Google
- **Flow:**
  - Receives `code` query parameter from Google
  - Exchanges authorization code for access token and ID token
  - Verifies ID token to extract user information (email, name, picture, googleId)
  - Upserts user in database (creates new or finds existing)
  - Creates JWT session token (30-day expiry)
  - Sets httpOnly cookie for web clients
  - Redirects to app via deep link: `frontend://?token=...&onboarded=...`
- **File:** `/backend/app/api/auth/google/callback/route.ts`

#### 3. Environment Variables (Backend)
Added to `/backend/.env`:
- `GOOGLE_CLIENT_SECRET`: OAuth client secret from Google Cloud Console
- `GOOGLE_REDIRECT_URI`: Callback URL (http://localhost:3000/api/auth/google/callback)
- `APP_SCHEME`: Deep link scheme for app redirection (frontend://)

### Frontend (React Native/Expo)

Refactored `/frontend/app/onboarding/alphaConfirm/index.tsx`:

#### Removed
- `expo-auth-session/providers/google` import
- `Google.useAuthRequest` hook
- Client-side ID token handling
- `promptAsync` function calls

#### Added
- `expo-linking` for deep link handling
- `WebBrowser.openAuthSessionAsync` to open backend OAuth initiate endpoint
- Deep link listener with `Linking.addEventListener('url', handleUrl)`
- Token extraction from deep link query parameters
- Automatic routing based on `onboarded` status

#### OAuth Flow in Frontend
1. User clicks "Let's be Alpha" → `handleGooglePress()` triggered
2. Opens `${BACKEND_URL}/api/auth/google/initiate` in system browser via WebBrowser
3. After OAuth completes, backend redirects to `frontend://?token=...&onboarded=...`
4. Deep link listener catches the URL
5. Extracts `token` and `onboarded` from query params
6. Stores token in `SecureStore` for API authentication
7. Routes to tabs (if onboarded) or back to onboarding (if new user)

## Security Features

1. **State Parameter:** CSRF protection via random state token in OAuth initiate
2. **ID Token Verification:** Backend verifies Google ID token before trusting user data
3. **Secure Token Storage:** JWT stored in httpOnly cookie (web) + SecureStore (native)
4. **Server-Side Code Exchange:** Authorization code only exchanged on backend (Google client secret never exposed to client)
5. **Database Validation:** User upsert with Prisma ensures data integrity

## Database Schema

User model includes:
- `id` (UUID): Primary key
- `email` (String, unique): User email from Google
- `googleId` (String, unique): Google user ID
- `name` (String?): Display name
- `picture` (String?): Profile picture URL
- `age` (Int?): From onboarding
- `gender` (String?): From onboarding
- `alphaLevel` (String?): From onboarding
- `notifications` (Boolean?): Notification preference
- `onboarded` (Boolean): Tracks if user completed onboarding
- `createdAt` (DateTime): Account creation timestamp
- `updatedAt` (DateTime): Last update timestamp

## API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/google/initiate` | GET | Start OAuth flow, redirect to Google |
| `/api/auth/google/callback` | GET | OAuth callback, exchange code, create session |
| `/api/auth/me` | GET | Get current authenticated user |
| `/api/auth/check` | POST | Check if email exists in database |
| `/api/auth/onboard` | POST | Save onboarding data for authenticated user |

## Dependencies Added

### Backend
- `googleapis@^144.0.0`: Google APIs client library for OAuth2

### Frontend (Already Installed)
- `expo-auth-session`: For WebBrowser API
- `expo-secure-store`: For token storage
- `expo-linking`: For deep link handling

## Configuration Requirements

### Backend Setup
1. Add `GOOGLE_CLIENT_SECRET` to `/backend/.env` (get from Google Cloud Console)
- Add authorized redirect URI in Google Cloud Console:
   - `http://192.168.43.192:3000/api/auth/google/callback` (for physical devices on local network)
   - `http://localhost:3000/api/auth/google/callback` (optional, for emulators)

### Frontend Setup
- Already configured with deep link scheme `"frontend"` in `app.json`
- Backend URL configured as `http://192.168.43.192:3000` (local network IP)

## Testing Instructions

See `OAUTH_SETUP_NEXT_STEPS.md` for detailed setup and testing steps.

## Files Created/Modified

### Created
- `/backend/app/api/auth/google/initiate/route.ts`
- `/backend/app/api/auth/google/callback/route.ts`
- `/OAUTH_SETUP_NEXT_STEPS.md`
- `/OAUTH_IMPLEMENTATION_SUMMARY.md` (this file)

### Modified
- `/backend/package.json`: Added googleapis dependency
- `/backend/.env`: Added GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, APP_SCHEME
- `/frontend/app/onboarding/alphaConfirm/index.tsx`: Refactored from expo-auth-session to WebBrowser + deep linking

## Next Steps

1. Obtain `GOOGLE_CLIENT_SECRET` from Google Cloud Console
2. Add redirect URI to Google OAuth Client configuration
3. Test OAuth flow end-to-end
4. For production: Update redirect URIs to use production domain
