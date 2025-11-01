Auth integration notes

This backend adds a minimal Google authentication flow backed by Prisma/Postgres.

Routes added:
- POST /api/auth/google  -- body: { idToken }
  - verifies Google id token
  - upserts user in DB
  - sets httpOnly `session` cookie with JWT
  - returns { user, onboarded }

- GET /api/auth/me -- reads session cookie, verifies JWT, returns { user, onboarded }

Setup steps (local):
1. Copy `.env.example` to `.env` and fill values (Neon DATABASE_URL, GOOGLE_CLIENT_ID, JWT_SECRET)
2. Install deps in backend: `npm install` (or yarn)
3. Initialize prisma and push schema:
   - `npx prisma generate`
   - `npx prisma db push` (or `prisma migrate dev` if you want migrations)
4. Run dev server: `npm run dev`

Notes:
- Keep `DATABASE_URL` and `JWT_SECRET` private (server-only). The client app should never receive these.
- The frontend should use Google Sign-In to obtain an `idToken` client-side, then POST it to `/api/auth/google`.
- The backend verifies the token with Google and issues a secure cookie; the client receives a logged-in session without handling secrets.
