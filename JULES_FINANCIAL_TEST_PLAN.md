# Jules Financial Operations Test Plan

## Overview

Test the complete end-to-end payment processing orchestration with Jules MCP agents, focusing on Stripe integration and credits package management.

## Current System Status

✅ **Database**: Full Supabase integration with credit packages, transactions, and user profiles  
✅ **API Routes**: Credits API (`/api/credits`) and Stripe API (`/api/credits/stripe`)  
✅ **Jules MCP**: Stripe agent using `@stripe/mcp` package  
✅ **Webhooks**: Stripe webhook processing system  
❌ **Environment**: Missing Stripe keys and inconsistent naming

## Test Environment Setup

### 1. Fix Environment Key Inconsistency

**Issue**: Scripts use `STRIPE_API_KEY` but API routes use `STRIPE_SECRET_KEY`
**Solution**: Unify to `STRIPE_SECRET_KEY` across all files

### 2. Add Test Stripe Keys to `.env.local`

```bash
# Stripe Test Keys (from Stripe Dashboard > Developers > API keys)
STRIPE_SECRET_KEY=sk_test_51234567890abcdef...
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef...

# For Jules MCP agent (unify naming)
STRIPE_API_KEY=$STRIPE_SECRET_KEY  # Add this line
```

### 3. Test Database Setup

Verify these tables exist in Supabase:

- `credit_packages` - Available credit packages
- `credits_transactions` - Transaction history
- `user_profiles` - User credit balances

## Jules MCP Testing

### 1. Test MCP Connection to Stripe Agent

```bash
# Test connection
npx tsx scripts/test-mcp-connection.ts

# Expected output: List of Stripe tools available
```

### 2. Test Jules CLI Integration

```bash
# Start Jules orchestrator
./subagents/wake-jules.sh

# Test Stripe agent communication
./subagents/stripe-agent.sh
```

### 3. Test Available Stripe Tools via Jules

Expected tools:

- `stripe_list_customers`
- `stripe_create_payment_intent`
- `stripe_list_products`
- `stripe_list_prices`
- `stripe_webhook_events`

## End-to-End Payment Flow Testing

### 1. Test Credits API

```bash
# Get user credits balance
curl -H "Authorization: Bearer $USER_TOKEN" \
  http://localhost:3000/api/credits

# Expected: User balance, packages, transactions
```

### 2. Test Stripe Checkout Session Creation

```bash
# Create payment session for a credit package
curl -X POST -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{"packageId": 1}' \
  http://localhost:3000/api/credits

# Expected: Stripe Checkout URL
```

### 3. Test Complete Payment Flow

1. **User selects credit package** → API creates Stripe checkout session
2. **User pays via Stripe** → Stripe webhook processes payment
3. **Credits added to user** → Database updated with transaction
4. **Jules notifies system** → MCP agents update status

## Jules CLI Communication Test

### 1. Test Jules Orchestrator Commands

```bash
# Test financial operations via Jules
echo "Test Stripe integration" | ./subagents/wake-jules.sh

# Expected: Jules communicates with Stripe agent
```

### 2. Test Real-time Payment Monitoring

Jules should be able to:

- Monitor webhook events
- Update credit balances
- Send transaction notifications
- Handle payment failures

## Test Credits Packages

### 1. Verify Database Packages

```sql
SELECT * FROM credit_packages WHERE is_active = true;
```

Expected packages:

- **Basic**: 10 credits - 10 RON
- **Standard**: 50 credits - 40 RON
- **Premium**: 100 credits - 70 RON
- **Professional**: 500 credits - 300 RON

### 2. Test Package Purchase Flow

1. User logs in → Check credits balance
2. Browse packages → Select desired package
3. Create checkout → Stripe session created
4. Complete payment → Credits added automatically
5. Verification → Balance updated in real-time

## Success Criteria

### Jules Integration ✅

- [ ] Jules CLI connects to Stripe agent successfully
- [ ] MCP tools list shows available Stripe functions
- [ ] Jules can execute payment monitoring tasks
- [ ] Error handling works for failed payments

### End-to-End Flow ✅

- [ ] Credit packages display correctly
- [ ] Checkout session creation works
- [ ] Webhook processing updates user balance
- [ ] Transaction history records properly
- [ ] Real-time balance updates

### Financial Operations ✅

- [ ] Test payments process successfully
- [ ] Webhook signature validation works
- [ ] Credit allocation happens automatically
- [ ] Error scenarios handled gracefully

## Troubleshooting

### Common Issues

1. **"STRIPE_SECRET_KEY is missing"** → Add to `.env.local`
2. **"MCP connection failed"** → Check Jules agent scripts
3. **"Webhook verification failed"** → Add webhook secret
4. **"Credits not added"** → Check database triggers

### Debug Commands

```bash
# Check Jules agent status
./subagents/wake-jules.sh

# Test Stripe API directly
curl -H "Authorization: Bearer $STRIPE_SECRET_KEY" \
  https://api.stripe.com/v1/customers

# Monitor webhook logs
tail -f .next/logs/webhook-*.log
```

## Next Steps After Testing

1. **Production Setup**: Configure live Stripe keys
2. **Jules Automation**: Set up automated credit monitoring
3. **Performance**: Optimize webhook processing speed
4. **Security**: Implement additional fraud protection
5. **Analytics**: Add payment analytics dashboard

---

**Test Owner**: Jules Orchestrator + External Contributor  
**Target**: Full financial automation with Jules MCP  
**Timeline**: Complete testing within current session
