# TikTok Business API Setup Guide

## How to Get TikTok Business API Access

### 1. Create TikTok Business Account
1. **Go to TikTok for Business**: https://ads.tiktok.com/
2. **Sign up for Business Account**:
   - Click "Get Started"
   - Enter business email and password
   - Verify email address
   - Complete business profile

### 2. Access TikTok Developer Portal
1. **Developer Portal**: https://developers.tiktok.com/
2. **Login with Business Account**
3. **Create New App**:
   - Click "Create App"
   - Fill in app details:
     - App Name: "Romanian Marketplace Automation"
     - App Description: "Social media automation for marketplace"
     - Business Category: "Business Services"
     - Website: your website URL
     - Privacy Policy URL: your privacy policy
     - Terms of Service URL: your terms of service

### 3. App Configuration
1. **Permissions Required**:
   - `user.info.basic` - Basic user information
   - `video.list` - Access to user's videos
   - `video.upload` - Upload videos
   - `comment.list` - Read comments
   - `comment.write` - Respond to comments

2. **Development Phases**:
   - **Development Mode**: Test with limited requests
   - **Production Mode**: Full API access after approval

### 4. API Keys and Tokens
After app creation, you'll get:
```
Client Key: YOUR_CLIENT_KEY
Client Secret: YOUR_CLIENT_SECRET
```

### 5. TikTok Marketing API (For Advanced Features)
1. **Marketing API Access**: https://ads.tiktok.com/marketing_api/docs
2. **Business Verification**: Complete business verification process
3. **Campaign Creation**: Create and manage ad campaigns
4. **Analytics**: Access detailed performance metrics

### 6. Environment Variables to Add
Add these to your `.env` file:
```bash
TIKTOK_CLIENT_KEY=your_client_key_here
TIKTOK_CLIENT_SECRET=your_client_secret_here
TIKTOK_ACCESS_TOKEN=your_access_token
TIKTOK_REFRESH_TOKEN=your_refresh_token
TIKTOK_BUSINESS_ACCOUNT_ID=your_business_account_id
TIKTOK_PIXEL_ID=your_pixel_id
```

### 7. API Rate Limits
- **Standard Plan**: 5,000 requests/day
- **Enterprise Plan**: 50,000+ requests/day
- **Rate Limit**: 100 requests/minute

### 8. TikTok Pixel Setup
1. **Create Pixel**: Go to Events Manager
2. **Install Code**: Add pixel to your website
3. **Configure Events**: Track conversions and engagement

### 9. Testing API Access
Use these endpoints to test:

```javascript
// Test connection
GET https://open-api.tiktok.com/oauth/userinfo/
Authorization: Bearer YOUR_ACCESS_TOKEN

// Get videos
GET https://open-api.tiktok.com/video/list/
Authorization: Bearer YOUR_ACCESS_TOKEN

// Upload video
POST https://open-api.tiktok.com/video/upload/
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### 10. Security Best Practices
- Store API keys securely
- Use HTTPS for all requests
- Implement proper error handling
- Regular token refresh
- Monitor API usage

## Quick Setup Checklist

- [ ] Create TikTok Business account
- [ ] Set up developer app
- [ ] Request API permissions
- [ ] Get client key and secret
- [ ] Implement OAuth flow
- [ ] Test API connection
- [ ] Configure pixel tracking
- [ ] Add environment variables
- [ ] Test automation features

## Romanian Market Specific Setup

### Geographic Targeting
- Set targeting to Romania (RO)
- Use Romanian language content
- Local time zone: Europe/Bucharest
- Cultural considerations for content

### Hashtag Strategy
- Mix trending global hashtags (#fyp, #viral)
- Romanian-specific hashtags (#romania, #bucuresti)
- Niche marketplace hashtags (#marketplace, #selling)

### Content Optimization
- Vertical video format (9:16)
- 15-60 second duration
- Hook in first 3 seconds
- Romanian audio/music when possible

## Support Resources
- **TikTok Developers**: https://developers.tiktok.com/
- **API Documentation**: https://developers.tiktok.com/doc/
- **Business Help Center**: https://ads.tiktok.com/help
- **Community Forum**: https://community.tiktok.com/

Once you have the API access, I can help you integrate it into the automation system!