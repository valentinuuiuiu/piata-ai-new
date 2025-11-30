# 🔐 Google OAuth Setup Guide for Piata AI RO

## Problem
You're getting `auth-code-error` after Google login. This means the OAuth redirect isn't configured correctly.

---

## ✅ STEP 1: Fix Your Code (Already Done!)

I've updated `src/app/autentificare/page.tsx` to use dynamic redirect URLs.

Changed from:
```typescript
redirectTo: `https://piata-ai.ro/auth/callback`
```

To:
```typescript
redirectTo: `${window.location.origin}/auth/callback`
```

This will work for both:
- Development: `http://localhost:3000/auth/callback`
- Production: `https://www.piata-ai.ro/auth/callback`

---

## 🔧 STEP 2: Configure Google Cloud Console

### A. Go to Google Cloud Console
1. Open: https://console.cloud.google.com/
2. Select your project (or create a new one)
3. Go to: **APIs & Services** → **Credentials**

### B. Find or Create OAuth 2.0 Client ID
1. Click on your OAuth 2.0 Client ID (or create new)
2. Find **"Authorized redirect URIs"** section
3. Add ALL of these URIs:

```
https://www.piata-ai.ro/auth/callback
https://piata-ai.ro/auth/callback
https://ndzoavaveppnclkujjhh.supabase.co/auth/v1/callback
http://localhost:3000/auth/callback
```

### C. Authorized JavaScript Origins
Add these:
```
https://www.piata-ai.ro
https://piata-ai.ro
https://ndzoavaveppnclkujjhh.supabase.co
http://localhost:3000
```

4. Click **SAVE**

---

## 🗄️ STEP 3: Configure Supabase

### A. Go to Supabase Dashboard
1. Open: https://supabase.com/dashboard/project/ndzoavaveppnclkujjhh/auth/providers
2. Find **Google** provider
3. Click **Edit** or enable it

### B. Add Credentials
1. **Client ID**: Paste from Google Cloud Console
2. **Client Secret**: Paste from Google Cloud Console

### C. Configure URLs
In Supabase Dashboard → Authentication → URL Configuration:

**Site URL:**
```
https://www.piata-ai.ro
```

**Redirect URLs** (add all):
```
https://www.piata-ai.ro/**
https://piata-ai.ro/**
http://localhost:3000/**
```

4. Click **SAVE**

---

## 🧪 STEP 4: Test It

### Development (localhost):
```bash
npm run dev
```
1. Go to: http://localhost:3000/autentificare
2. Click "Continuă cu Google"
3. Should redirect to Google login
4. After login, should return to your app

### Production:
1. Deploy your changes
2. Go to: https://www.piata-ai.ro/autentificare
3. Click "Continuă cu Google"
4. Should work! ✅

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"
**Cause:** The redirect URI in your request doesn't match Google Cloud Console

**Fix:**
1. Check EXACT URL in error message
2. Add that EXACT URL to Google Cloud Console → Authorized redirect URIs
3. Make sure there are no typos (http vs https, www vs non-www)

### Error: "auth-code-error" 
**Cause:** Code exchange failed

**Fix:**
1. Check Supabase has correct Google Client ID and Secret
2. Clear browser cookies and try again
3. Wait 5 minutes for Google to propagate changes
4. Check Supabase logs: Dashboard → Logs

### Error: "Invalid client"
**Cause:** Wrong Client ID or Client Secret

**Fix:**
1. Go to Google Cloud Console
2. Copy Client ID and Secret again (maybe you missed a character)
3. Update in Supabase Dashboard
4. Try again

---

## 📋 Checklist

- [ ] Updated code to use dynamic redirect URLs
- [ ] Added redirect URIs to Google Cloud Console
- [ ] Added JavaScript origins to Google Cloud Console  
- [ ] Configured Google provider in Supabase
- [ ] Added Client ID and Secret to Supabase
- [ ] Set Site URL in Supabase
- [ ] Added redirect URLs in Supabase
- [ ] Tested on localhost (if applicable)
- [ ] Deployed and tested on production

---

## 🔗 Important Links

**Google Cloud Console:**
https://console.cloud.google.com/apis/credentials

**Supabase Auth Providers:**
https://supabase.com/dashboard/project/ndzoavaveppnclkujjhh/auth/providers

**Supabase Auth URL Config:**
https://supabase.com/dashboard/project/ndzoavaveppnclkujjhh/auth/url-configuration

**Test Login Page:**
- Dev: http://localhost:3000/autentificare
- Prod: https://www.piata-ai.ro/autentificare

---

## 📝 Notes

1. **www vs non-www**: Add BOTH versions to be safe
2. **Google changes take time**: Wait 5-10 minutes after saving
3. **Clear cookies**: Sometimes old sessions cause issues
4. **Check browser console**: Press F12 to see errors

---

## ✅ After Setup

Once working:
1. Test with different Google accounts
2. Test signup and login flows
3. Verify user data is saved correctly
4. Test logout and re-login

---

**Need more help?** Check the error page I created at `/auth/auth-code-error` for detailed troubleshooting!
