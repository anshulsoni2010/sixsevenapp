# Stripe Paywall Setup Guide

## Overview
The app now includes a complete paywall system with two subscription plans (Monthly and Yearly) powered by Stripe.

## Flow
1. User completes onboarding → Auth → Setup screen
2. Setup screen checks subscription status
3. If not subscribed → **Paywall screen**
4. If subscribed → **Chat screen**

## Files Created

### Frontend
- `/app/paywall/index.tsx` - Paywall screen with 2 plans
- `/app/chat/index.tsx` - Chat screen for subscribed users

### Backend
- `/app/api/stripe/create-checkout/route.ts` - Creates Stripe checkout session
- `/app/api/stripe/webhook/route.ts` - Handles Stripe webhooks
- `/app/api/user/me/route.ts` - Returns user subscription status

### Database
Updated `User` model with:
- `subscribed` (Boolean)
- `subscriptionPlan` (String - 'monthly' or 'yearly')
- `stripeCustomerId` (String)
- `stripeSubscriptionId` (String)
- `subscriptionStatus` (String - 'active', 'canceled', 'past_due')
- `subscriptionEndsAt` (DateTime)

## Stripe Setup Steps

### 1. Create Stripe Account
1. Go to https://dashboard.stripe.com/register
2. Create a new account

### 2. Get API Keys
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy **Secret key** → Add to `.env` as `STRIPE_SECRET_KEY`
3. Copy **Publishable key** → Add to `.env` as `STRIPE_PUBLISHABLE_KEY`

### 3. Create Products & Prices
1. Go to https://dashboard.stripe.com/test/products
2. Click "+ Add product"

**Monthly Plan:**
- Name: "6 7 Monthly"
- Description: "Monthly subscription to 6 7"
- Price: $9.99 USD
- Billing period: Monthly
- Copy the Price ID (starts with `price_...`)
- Update in `/app/paywall/index.tsx`:
  ```typescript
  priceId: 'price_YOUR_MONTHLY_ID'
  ```

**Yearly Plan:**
- Name: "6 7 Yearly"
- Description: "Yearly subscription to 6 7"
- Price: $79.99 USD
- Billing period: Yearly
- Copy the Price ID
- Update in `/app/paywall/index.tsx`:
  ```typescript
  priceId: 'price_YOUR_YEARLY_ID'
  ```

### 4. Set Up Webhooks
1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "+ Add endpoint"
3. Endpoint URL: `https://your-backend-url.com/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copy the **Signing secret** → Add to `.env` as `STRIPE_WEBHOOK_SECRET`

### 5. Update Environment Variables
In `/backend/.env`:
```env
STRIPE_SECRET_KEY="sk_test_YOUR_SECRET_KEY"
STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_PUBLISHABLE_KEY"
STRIPE_WEBHOOK_SECRET="whsec_YOUR_WEBHOOK_SECRET"
```

## Testing Locally

### 1. Install Stripe CLI
```bash
brew install stripe/stripe-cli/stripe
# or download from https://stripe.com/docs/stripe-cli
```

### 2. Login to Stripe
```bash
stripe login
```

### 3. Forward Webhooks to Local Backend
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This will give you a webhook secret starting with `whsec_...` - use this for local testing.

### 4. Test Payment Flow
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npx expo start`
3. Go through onboarding
4. On paywall screen, click Subscribe
5. Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any CVC
   - Any ZIP code
6. Webhook will fire and update user's subscription status

## Test Cards
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

Full list: https://stripe.com/docs/testing#cards

## Production Deployment

### 1. Switch to Live Mode
1. Go to https://dashboard.stripe.com/test/dashboard
2. Toggle "Test mode" to OFF (top right)
3. Get new live API keys from https://dashboard.stripe.com/apikeys
4. Create new products with live Price IDs
5. Update `.env` with live keys

### 2. Set Up Production Webhooks
1. Add webhook endpoint with your production URL
2. Update `STRIPE_WEBHOOK_SECRET` with production secret

### 3. Enable Payment Methods
1. Go to https://dashboard.stripe.com/settings/payment_methods
2. Enable desired payment methods (Card, Apple Pay, Google Pay, etc.)

## Subscription Management

Users can manage their subscriptions through:
1. Stripe Customer Portal (recommended)
2. In-app subscription management (custom implementation)

### Enable Customer Portal
1. Go to https://dashboard.stripe.com/settings/billing/portal
2. Configure portal settings
3. Generate portal link in your app:
```typescript
const session = await stripe.billingPortal.sessions.create({
  customer: user.stripeCustomerId,
  return_url: 'https://your-app-url.com',
});
```

## Current Limitations

1. **WebBrowser Integration**: The paywall currently shows an alert instead of opening Stripe checkout. You need to:
   - Open `data.url` in WebBrowser
   - Listen for redirect back to app
   - Verify subscription status

2. **Chat Implementation**: The chat screen is a placeholder. Implement actual Gen Alpha translation logic.

3. **Subscription Check on App Launch**: Currently routes to chat. Should check subscription status from backend.

## Next Steps

1. ✅ Get Stripe API keys
2. ✅ Create products & prices
3. ✅ Update Price IDs in paywall screen
4. ✅ Set up webhook forwarding for local testing
5. ⏳ Implement WebBrowser checkout flow
6. ⏳ Add subscription status check in _layout.tsx
7. ⏳ Implement Gen Alpha chat functionality
8. ⏳ Add customer portal for subscription management
9. ⏳ Test complete flow end-to-end
10. ⏳ Deploy to production with live Stripe keys
