# Keys & API Setup — sixseven

This document explains how to obtain the secrets and keys the project needs, which URLs/redirects to register, how to wire them into the repo locally, and how to configure common hosting providers (Vercel / EAS / GitHub Actions). It also lists the backend API endpoints you can use for testing, with example curl requests.

DO NOT commit any secrets (.env) to source control.

## Summary — what you need

- Neon Postgres `DATABASE_URL` (server-only)
- Google OAuth Client ID (public for frontend, also placed on backend for verification)
- `JWT_SECRET` — long random secret for signing JWTs (server-only)
- (Optional) Google API key or Service Account for other Google APIs

## 1) Get your Neon Postgres DATABASE_URL

1. Sign into Neon: https://console.neon.tech/ or https://neon.tech/ and open your project.
2. Under the project, find "Connection details" / "Connection info".
3. Copy the full Postgres connection string (it looks like):

```
postgresql://username:password@ep-<host>.neon.tech/<dbname>?sslmode=require&channel_binding=require
```

4. Place it into `backend/.env` (server-only). Example:

```
DATABASE_URL='postgresql://neondb_owner:REDACTED@ep-...neon.tech/neondb?sslmode=require&channel_binding=require'
```

Notes:
- Use Neon dashboard to create roles if you want different privileges.
- Keep this secret out of your frontend code.

## 2) Create a Google OAuth Client ID (for Sign-In)

1. Visit Google Cloud Console: https://console.cloud.google.com/
2. Select or create a project.
3. Go to `APIs & Services` → `Credentials`.
4. Click `Create Credentials` → `OAuth client ID`.
5. Choose `Web application` (for Expo proxy + web dev). Name it (e.g., `sixseven-dev`).
6. Add **Authorized redirect URIs** (minimum):

   - `https://auth.expo.io/@<expo-username>/<expo-slug>`
     - Replace `<expo-username>` with your Expo username and `<expo-slug>` with the slug from `frontend/app.json` (default: `frontend`).
     - Example: `https://auth.expo.io/@anshulsonidev/frontend`
   - (Optional for web) `http://localhost:19006`

7. Save and copy the **Client ID** (string like `XXXXX-...apps.googleusercontent.com`).

Where to put it:
- `backend/.env` (server):

```
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
```

- `frontend/app.json` (public `extra` value) — the project reads this as `EXPO_PUBLIC_GOOGLE_CLIENT_ID`:

```json
"extra": {
  "EXPO_PUBLIC_GOOGLE_CLIENT_ID": "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
  "BACKEND_URL": "http://localhost:3000"
}
```

Notes:
- For native standalone apps you may also want Android / iOS OAuth clients with proper package/bundle IDs or scheme-based redirects.
- The server verifies ID tokens using `GOOGLE_CLIENT_ID` to ensure the token's audience (`aud`) matches.

## 3) Generate a secure JWT secret

On macOS / Linux, run locally:

```bash
openssl rand -base64 48
```

Copy the output and set in `backend/.env`:

```
JWT_SECRET="paste-long-random-output-here"
```

Keep this value secret. Use your provider's secret manager for production (Vercel / Render / Heroku / EAS secrets).

## 4) Backend `.env` example (local)

Create `backend/.env` (DO NOT commit). Example:

```
DATABASE_URL='postgresql://neondb_owner:...@ep-...neon.tech/neondb?sslmode=require&channel_binding=require'
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
JWT_SECRET="very-long-random-secret"
```

## 5) Expo / Frontend config

- Edit `frontend/app.json` and set `expo.extra.EXPO_PUBLIC_GOOGLE_CLIENT_ID` and `BACKEND_URL`.
- Example already added in the repo; replace placeholders with your Client ID and local backend URL.

## 6) Redirect URIs you should register in Google Cloud Console

- Expo (recommended dev flow using AuthSession proxy):
  - `https://auth.expo.io/@<expo-username>/<expo-slug>`

- Local web (optional):
  - `http://localhost:19006`

- Production web (example):
  - `https://yourdomain.com` (or exact redirect path if you use one)

- Native standalone (example schemes):
  - `yourapp://redirect` or `com.your.bundle.id:/oauth2redirect/google`

Add whichever URIs you plan to use.

## 7) Configure secrets in hosting / CI

- Vercel: Project → Settings → Environment Variables
  - Add `DATABASE_URL`, `GOOGLE_CLIENT_ID`, `JWT_SECRET` for Production & Preview.

- GitHub Actions: Repository → Settings → Secrets → Actions → New repository secret
  - Add `DATABASE_URL`, `GOOGLE_CLIENT_ID`, `JWT_SECRET`

- EAS (Expo):
  - Use `eas secret:create` or EAS dashboard for build-time secrets.

## 8) Backend API endpoints (what exists in this project)

Base URL (local dev): `http://localhost:3000`

1) POST /api/auth/google
   - Purpose: Accept Google `idToken` (ID token from client), verify with Google, upsert user in DB, set secure httpOnly `session` cookie, return JSON with user and token.
   - Body: `{ "idToken": "<id_token_from_client>" }`
   - Response (200): `{ "token": "<jwt>", "user": { id, email, name, picture, ... }, "onboarded": true|false }`
   - Cookie: `Set-Cookie: session=<jwt>; HttpOnly; SameSite=Lax; Secure` (in production)

2) GET /api/auth/me
   - Purpose: Returns current user using `session` cookie.
   - No body. Reads cookie or returns `{ user: null }` if no valid session.

3) POST /api/auth/check
   - Purpose: Check whether an email exists (used by "Existing account" flow UI).
   - Body: `{ "email": "user@example.com" }`
   - Response: `{ "exists": true|false, "onboarded": true|false }

4) POST /api/auth/onboard
   - Purpose: Accept onboarding data, validate token in `session` cookie or Authorization Bearer token, update User, set `onboarded=true`.
   - Body: `{ "name": "...", "age": 25, "gender": "Male", "alphaLevel": "2x", "notifications": true }
   - Response: `{ "user": {...}, "onboarded": true }

## 9) Test requests (examples)

- Test `/api/auth/check`:

```bash
curl -X POST http://localhost:3000/api/auth/check \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

- Test `/api/auth/me` (web - cookie present in browser). To test cookie via curl, you must include it:

```bash
# After you've obtained a cookie via a browser-based login, you can reuse it with curl:
curl -i "http://localhost:3000/api/auth/me" -H "Cookie: session=PASTE_JWT_HERE"
```

- To inspect `/api/auth/google` Set-Cookie header (server response):

```bash
curl -i -X POST http://localhost:3000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"idToken":"PASTE_ID_TOKEN_HERE"}'
```

Note: You must obtain a real `idToken` by signing in via Google (browser or Expo AuthSession). I can help simulate if you provide a test idToken but normally you'll test from the app.

## 10) How frontend uses these endpoints (flow)

1. Client obtains Google `id_token` via Expo AuthSession (webClientId configured).
2. Client calls `POST /api/auth/google` with `{ idToken }`.
3. Server verifies `id_token`, creates/updates User, sets httpOnly cookie, and returns `{ token, user, onboarded }`.
   - Web clients rely on cookie-based session (cookie stored by browser).
   - Native clients store returned `token` in `expo-secure-store` and use `Authorization: Bearer <token>` for subsequent requests.
4. If `onboarded` is false, client continues onboarding UI and finally POSTs saved onboarding JSON to `/api/auth/onboard`.

## 11) Troubleshooting

- Invalid token / 401: Ensure the `id_token` was created using the same Client ID as the backend `GOOGLE_CLIENT_ID` and that the redirect URIs for that client ID match your environment.
- Cookies not set on native: HTTP-only cookies are not reliably stored in Expo Go; rely on returned `token` stored in SecureStore.
- DB connection errors: verify `DATABASE_URL` is correct and that your IP/network or Neon configuration allows access (Neon usually manages this for you).

## 12) Security checklist

- Do not commit `.env` to git.
- Use long random `JWT_SECRET` and rotate if compromised.
- Use HTTPS and `secure` cookie flag in production.
- Consider implementing refresh tokens + session table if you require logout/revocation.
- Rate-limit auth endpoints in production.

## 13) Want me to wire values for you?

If you paste the **Google Client ID** (non-secret) I can automatically insert it into `frontend/app.json` and optionally add it to `backend/.env` if you confirm you want me to update that server file. I will never output or echo back your `DATABASE_URL` or `JWT_SECRET`.

---

If you want, I can also add a small `scripts/check_env.js` utility that prints whether required envs are configured and performs a quick `curl`-style verification of `http://localhost:3000/api/auth/me`.
