
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const REDIRECT_URI = 'https://piata-ai.ro/api/auth/callback/tiktok';
const SCOPES = 'user.info.basic,video.list,video.upload';

if (!CLIENT_KEY) {
  console.error('TIKTOK_CLIENT_KEY not found in .env.local');
  process.exit(1);
}

const authUrl = `https://www.tiktok.com/auth/authorize/?client_key=${CLIENT_KEY}&scope=${SCOPES}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=random_state_string`;

console.log('\nTikTok Authorization URL:');
console.log(authUrl);
console.log('\nPlease visit this URL to authorize the app.');
