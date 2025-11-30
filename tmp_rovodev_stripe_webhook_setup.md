# Stripe Webhook Setup Guide

## 🔗 Where to Find Your Stripe Webhook

### **1. Go to Stripe Dashboard**
- **Test Mode**: https://dashboard.stripe.com/test/webhooks
- **Live Mode**: https://dashboard.stripe.com/webhooks

### **2. Create a New Webhook Endpoint**

Click **"Add endpoint"** and configure:

**Webhook URL:**
```
https://your-domain.com/api/stripe/webhook
```

For example:
- Production: `https://piata-ai.vercel.app/api/stripe/webhook`
- Or your custom domain: `https://yourdomain.com/api/stripe/webhook`

**Events to listen for:**
Select these events:
- ✅ `checkout.session.completed` (REQUIRED - this triggers credit addition)

Optionally add:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

### **3. Get Your Webhook Secret**

After creating the endpoint, Stripe will show you:
```
whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Copy this secret!

### **4. Add to Environment Variables**

**In Vercel:**
1. Go to: https://vercel.com/your-project/settings/environment-variables
2. Add:
   - Name: `STRIPE_WEBHOOK_SECRET`
   - Value: `whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Environment: Production, Preview, Development

**In Local .env.local:**
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### **5. Test the Webhook**

Stripe provides a "Send test webhook" button in the dashboard.

Or use Stripe CLI for local testing:
```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/stripe/webhook

# This will give you a webhook secret like:
# whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 📝 Current Webhook Implementation

Your webhook is already implemented at:
**`src/app/api/stripe/webhook/route.ts`**

It does:
1. ✅ Verifies Stripe signature
2. ✅ Listens for `checkout.session.completed`
3. ✅ Extracts `user_id` and `package_id` from metadata
4. ✅ Adds credits to `user_profiles.credits_balance`
5. ✅ Logs transaction in `credits_transactions`

---

## 🔐 Required Stripe Keys

You need TWO keys from Stripe:

### **Secret Key** (for API calls)
- Dashboard: https://dashboard.stripe.com/test/apikeys
- Format: `sk_test_xxxxx` (test) or `sk_live_xxxxx` (live)
- Add as: `STRIPE_SECRET_KEY`

### **Webhook Secret** (for webhook verification)
- Dashboard: https://dashboard.stripe.com/test/webhooks
- Format: `whsec_xxxxx`
- Add as: `STRIPE_WEBHOOK_SECRET`

---

## ✅ Checklist

- [ ] Created webhook endpoint in Stripe Dashboard
- [ ] Webhook URL points to `/api/stripe/webhook`
- [ ] Selected `checkout.session.completed` event
- [ ] Copied webhook secret (`whsec_...`)
- [ ] Added `STRIPE_WEBHOOK_SECRET` to Vercel
- [ ] Added `STRIPE_SECRET_KEY` to Vercel
- [ ] Tested with a payment

---

## 🧪 Test Payment Flow

1. Visit `/credits` page
2. Click "Cumpără Acum"
3. Use test card: `4242 4242 4242 4242`
4. Any future date, any CVC
5. Check webhook logs in Stripe Dashboard
6. Verify credits added to user balance
