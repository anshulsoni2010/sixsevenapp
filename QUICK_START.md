# Google OAuth - Quick Start Guide

## ⚡ Immediate Action Required

Before testing, you need to add your **Google Client Secret** to the backend configuration.

### Step 1: Get Your Client Secret

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find your OAuth 2.0 Client ID: `835051220341-681sotsfbku3vi0n4r23o4cfbvgpp8o5`
3. Click on it to view details
4. Copy the **Client Secret** value

### Step 2: Update Backend .env

Open `/backend/.env` and replace:
```bash
GOOGLE_CLIENT_SECRET="YOUR_CLIENT_SECRET_HERE"
```

With your actual secret:
```bash
GOOGLE_CLIENT_SECRET="GOCSPX-your-actual-secret-here"
```

### Step 3: Add Redirect URI to Google Cloud

In the same OAuth Client configuration page:

1. Find **Authorized redirect URIs** section
2. Click **+ ADD URI**
3. Add: `http://192.168.43.192:3000/api/auth/google/callback`
4. Click **SAVE**

> **Note:** If testing on iOS Simulator/Android Emulator, also add `http://localhost:3000/api/auth/google/callback`

### Step 4: Start Your Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npx expo start
```

### Step 5: Test OAuth Flow

1. Open the app on your device/simulator
2. Navigate through onboarding screens to "Alpha Confirm"
3. Click **"Let's be Alpha"** button
4. Browser should open with Google sign-in
5. Sign in with your Google account
6. App should redirect back and log you in

## ✅ What's Already Done

- ✅ Backend OAuth routes created
- ✅ Frontend OAuth integration complete
- ✅ Database schema ready
- ✅ Deep linking configured
- ✅ JWT session handling implemented
- ✅ googleapis package installed

## 🔧 Troubleshooting

### "Invalid Client" Error
- Make sure `GOOGLE_CLIENT_SECRET` is correct in `.env`
- Verify redirect URI is added in Google Cloud Console

### "Redirect URI Mismatch"
- Check that `GOOGLE_REDIRECT_URI` in `.env` matches exactly what's in Google Cloud Console
- Make sure it's `http://192.168.43.192:3000/api/auth/google/callback` for physical devices
- For emulators, you may need to add `http://localhost:3000/api/auth/google/callback` as well

### App Doesn't Redirect Back
- Verify `APP_SCHEME="frontend://"` in backend `.env`
- Check that `"scheme": "frontend"` is in frontend `app.json`

### Backend Not Reachable from Device
- If using physical device, ensure both are on same WiFi
- Backend URL in `frontend/app.json` should be your local network IP (currently: `192.168.43.192`)
- For iOS Simulator/Android Emulator, use `http://localhost:3000`

## 📚 Additional Resources

- **Detailed setup:** See `OAUTH_SETUP_NEXT_STEPS.md`
- **Implementation details:** See `OAUTH_IMPLEMENTATION_SUMMARY.md`
- **API credentials guide:** See `KEYS_AND_API_SETUP.md`

## 🎯 Next Steps After OAuth Works

Once OAuth is working, users will:
1. Sign in with Google
2. If new user → continue through onboarding screens (name, gender, age, notifications)
3. Onboarding data gets saved to `/api/auth/onboard`
4. User redirected to main app tabs

All user data (including Google profile + onboarding data) is stored in your Neon Postgres database.
