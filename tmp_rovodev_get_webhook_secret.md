# 🔐 Get Your Stripe Webhook Secret

## Step 1: Go to Your Webhook in Stripe Dashboard

**Test Mode:**
https://dashboard.stripe.com/test/webhooks

**Live Mode:**
https://dashboard.stripe.com/webhooks

## Step 2: Click on Your Webhook

You should see your webhook URL:
```
https://your-domain.com/api/stripe/webhook
```

## Step 3: Reveal the Signing Secret

Look for a section called **"Signing secret"**

Click **"Reveal"** or **"Show"** button

You'll see something like:
```
whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Step 4: Copy and Add to Vercel

### **Option A: Using Vercel Dashboard**

1. Go to: https://vercel.com/your-username/your-project/settings/environment-variables
2. Click **"Add New"**
3. Enter:
   - **Key:** `STRIPE_WEBHOOK_SECRET`
   - **Value:** `whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Environments:** ✅ Production, ✅ Preview, ✅ Development
4. Click **"Save"**

### **Option B: Using Vercel CLI**

```bash
vercel env add STRIPE_WEBHOOK_SECRET
# Paste the whsec_xxx value when prompted
```

## Step 5: Redeploy (Important!)

After adding the environment variable:

```bash
vercel --prod
```

Or push to git:
```bash
git commit --allow-empty -m "Trigger redeploy for webhook secret"
git push
```

---

## ✅ Verification Checklist

- [ ] Found webhook in Stripe Dashboard
- [ ] Copied signing secret (whsec_...)
- [ ] Added `STRIPE_WEBHOOK_SECRET` to Vercel
- [ ] Redeployed application
- [ ] Tested a purchase

---

## 🧪 Test Your Webhook

1. In Stripe Dashboard, click on your webhook
2. Click **"Send test webhook"** button
3. Select event: `checkout.session.completed`
4. Click **"Send test webhook"**
5. Check response (should be 200 OK)

---

## 📝 What Happens When User Buys Credits

1. User clicks "Cumpără Acum" → Redirects to Stripe
2. User completes payment
3. Stripe sends `checkout.session.completed` event to your webhook
4. Your webhook (`/api/stripe/webhook`) receives it
5. Verifies signature using `STRIPE_WEBHOOK_SECRET`
6. Extracts user_id and credits from metadata
7. Adds credits to `user_profiles.credits_balance`
8. Logs transaction in `credits_transactions`
9. User sees updated balance

---

**Need help with any step?**
