#!/usr/bin/env node

/**
 * Production test:
 * 1) Upload an image to Supabase Storage bucket `listings`
 * 2) Read it back (public URL + HEAD)
 * 3) Create TEST adverts in `anunturi` referencing the uploaded image(s)
 * 4) Verify via production API
 *
 * NOTE: Creates real rows in production DB (clearly marked as TEST).
 */

const crypto = require('crypto');

const SUPABASE_URL = 'https://ndzoavaveppnclkujjhh.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_ROLE_KEY) {
  console.error('❌ ERROR: SUPABASE_SERVICE_ROLE_KEY not found in environment.');
  process.exit(1);
}

const PROD_API = 'https://www.piata-ai.ro';

function headers() {
  return {
    apikey: SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  };
}

async function head(url) {
  const res = await fetch(url, { method: 'HEAD' });
  return { ok: res.ok, status: res.status, contentType: res.headers.get('content-type'), len: res.headers.get('content-length') };
}

async function uploadPngToStorage({ userId, fileNameBase, pngBytes }) {
  // Storage upload endpoint: /storage/v1/object/{bucket}/{path}
  const objectPath = `${userId}/${fileNameBase}.png`;
  const url = `${SUPABASE_URL}/storage/v1/object/listings/${encodeURIComponent(objectPath)}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      ...headers(),
      'Content-Type': 'image/png',
      'x-upsert': 'true',
    },
    body: pngBytes,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Upload failed ${res.status}: ${text}`);
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/listings/${objectPath}`;
  return { objectPath, publicUrl };
}

function tinyPngBuffer() {
  // 1x1 transparent PNG
  return Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/ax0f0cAAAAASUVORK5CYII=',
    'base64'
  );
}

async function insertTestAd({ userId, imageUrls, categoryId = 3, subcategoryId = 790 }) {
  const title = `TEST AD - Storage Upload ${new Date().toISOString()}`;
  const payload = {
    user_id: userId,
    category_id: categoryId,
    subcategory_id: subcategoryId,
    title,
    description: 'TEST AD created by automated system test. Safe to delete.',
    price: 1,
    location: 'TEST',
    phone: '0000000000',
    images: imageUrls,
    status: 'active',
    is_premium: false,
    is_featured: false,
  };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/anunturi`, {
    method: 'POST',
    headers: {
      ...headers(),
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Insert ad failed ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data[0];
}

async function verifyAdViaProdApi(adId) {
  const res = await fetch(`${PROD_API}/api/anunturi/${adId}`);
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`Prod API fetch failed ${res.status}: ${t}`);
  }
  const data = await res.json();
  return data;
}

async function main() {
  console.log('🔎 Starting production Storage + Ads test...');

  // Use a REAL existing user id from `public.users` because `anunturi.user_id` has a FK.
  const userId = await (async () => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?select=id&limit=1`, {
      headers: { ...headers() },
    });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      throw new Error(`Failed to fetch an existing user id from public.users: ${res.status} ${t}`);
    }
    const rows = await res.json();
    const id = rows?.[0]?.id;
    if (!id) throw new Error('No users found in public.users; cannot create test ads');
    return id;
  })();
  console.log('👤 Using existing user_id:', userId);

  // 1) Upload a tiny PNG
  const nonce = crypto.randomBytes(6).toString('hex');
  const fileNameBase = `rovodev_test_${Date.now()}_${nonce}`;

  console.log('⬆️  Uploading image to Supabase Storage...');
  const { objectPath, publicUrl } = await uploadPngToStorage({
    userId,
    fileNameBase,
    pngBytes: tinyPngBuffer(),
  });

  console.log('✅ Uploaded:', objectPath);
  console.log('🌐 Public URL:', publicUrl);

  // 2) HEAD the public URL
  console.log('🔁 Verifying public URL via HEAD...');
  const headInfo = await head(publicUrl);
  console.log('   ', headInfo);
  if (!headInfo.ok) throw new Error('Public URL not accessible');

  // 3) Create 2 TEST ads
  console.log('🧾 Creating TEST adverts...');
  const ads = [];
  for (let i = 1; i <= 2; i++) {
    const ad = await insertTestAd({ userId, imageUrls: [publicUrl] });
    console.log(`✅ Created ad ${i}: id=${ad.id}, title=${ad.title}`);
    ads.push(ad);
  }

  // 4) Verify via production API
  console.log('🔎 Verifying adverts via https://www.piata-ai.ro/api/anunturi/[id] ...');
  for (const ad of ads) {
    const fetched = await verifyAdViaProdApi(ad.id);
    console.log(`✅ Verified ad id=${ad.id}: images=${(fetched.images || []).length}`);
    if (!fetched.images?.[0]?.includes('supabase.co/storage')) {
      throw new Error('Fetched ad does not include expected image URL');
    }

    const imgHead = await head(fetched.images[0]);
    console.log(`   🖼️ image HEAD:`, imgHead);
    if (!imgHead.ok) throw new Error('Image URL in ad is not accessible');
  }

  console.log('\n🎉 SUCCESS: Storage upload + adverts creation + retrieval verified in production.');
  console.log('Created TEST ads (safe to delete):', ads.map(a => a.id));
}

main().catch(err => {
  console.error('❌ FAILED:', err);
  process.exit(1);
});
