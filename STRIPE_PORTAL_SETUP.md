# Stripe Customer Portal Setup

## Quick Setup (5 minutes)

### Step 1: Go to Stripe Portal Settings
Open this link: https://dashboard.stripe.com/test/settings/billing/portal

### Step 2: Activate the Portal
Click the **"Activate test link"** button

### Step 3: Configure Portal Features
Check these options:
- ✅ **Invoice history** - Let customers view past invoices
- ✅ **Update payment method** - Let customers update their card
- ✅ **Cancel subscriptions** - Let customers cancel anytime
- ✅ **Update subscriptions** - Let customers change plans

### Step 4: Set Cancellation Behavior
Under "Subscriptions" section:
- Choose: **"Cancel immediately"** or **"Cancel at period end"** (recommended)
- Add cancellation reasons (optional): "Too expensive", "Not using enough", "Other"

### Step 5: Customize Branding (Optional)
- Add your logo
- Set brand colors
- Customize heading text

### Step 6: Save Settings
Click **"Save changes"** at the bottom

## Done! ✅

Your portal is now active. When users tap "Billing & Cancellation" in the app, they'll be able to:
- View all invoices and payment history
- Update payment methods
- Cancel subscription
- Download receipts
- See next billing date

## Test the Portal

1. In your app, go to Subscription page
2. Tap "Billing & Cancellation"
3. Tap "View Billing Details"
4. The Stripe Customer Portal should open in a browser

## Production Setup

When you're ready to go live:
1. Switch to Live mode in Stripe Dashboard (toggle in top right)
2. Go to https://dashboard.stripe.com/settings/billing/portal
3. Configure the same settings for production
4. Make sure to enable the live webhook endpoint

---

**Need Help?**
- Stripe Portal Docs: https://stripe.com/docs/billing/subscriptions/integrating-customer-portal
- Your app is already integrated, just needs portal activation!
