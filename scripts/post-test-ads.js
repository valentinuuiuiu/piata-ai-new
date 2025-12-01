const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');

// Configure via env vars or fall back to known values in repo
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ndzoavaveppnclkujjhh.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kem9hdmF2ZXBwbmNsa3VqamhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDM5NzkxMSwiZXhwIjoyMDc5OTczOTExfQ.2d6bkmNV2kIaLLSOzEE0DQ-emoyZBqwMi8s1ZANKM0g';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function ensureCategory() {
  const { data, error } = await supabase
    .from('categories')
    .select('id')
    .limit(1)
    .single();

  if (error || !data) {
    const { data: newCat, error: e } = await supabase
      .from('categories')
      .insert({ name: 'TestCategory', slug: `test-${Date.now()}`, icon: '🧪' })
      .select()
      .single();
    if (e) throw e;
    return newCat.id;
  }

  return data.id;
}

async function createTestUser(email, phone) {
  const id = randomUUID();

  // Try upsert by email unique constraint to ensure user exists
  const { data, error } = await supabase.from('users')
    .upsert(
      { id, name: 'Test User', email, phone, password: null },
      { onConflict: 'email', ignoreDuplicates: false }
    )
    .select()
    .single();

  if (error) {
    // Fallback: try to fetch existing by email
    const { data: existing, error: e } = await supabase.from('users').select('id').eq('email', email).single();
    if (e) throw e;
    return existing.id;
  }

  return data.id || id;
}

async function postTestAds() {
  const categoryId = await ensureCategory();

  const testEmail = process.env.TEST_EMAIL || `test+${Date.now()}@example.com`;
  const testPhone = process.env.TEST_PHONE || '+40123456789';

  // Prefer using an existing user to avoid FK / RLS issues. If none exists, try to create one.
  const { data: anyUser } = await supabase.from('users').select('id,email').limit(1).single();
  let userId;
  if (anyUser && anyUser.id) {
    userId = anyUser.id;
    console.log('Using existing user:', anyUser.email || userId);
  } else {
    try {
      userId = await createTestUser(testEmail, testPhone);
    } catch (e) {
      console.error('Could not create a test user and no existing user found. Aborting. Error:', e.message || e);
      process.exit(1);
    }
  }

  console.log('Will insert ads with user_id =', userId);

  const ads = [
    {
      user_id: userId,
      category_id: categoryId,
      title: 'Test bike for sale',
      description: 'A nice test bicycle, almost new. Used only for automated tests.',
      price: 120.00,
      location: 'București',
      phone: testPhone,
      images: JSON.stringify(['https://picsum.photos/seed/1/800/600']),
      status: 'active'
    },
    {
      user_id: userId,
      category_id: categoryId,
      title: 'Test piano lessons',
      description: 'Experienced teacher offering piano lessons (test entry).',
      price: 30.00,
      location: 'Cluj-Napoca',
      phone: testPhone,
      images: JSON.stringify([]),
      status: 'active'
    },
    {
      user_id: userId,
      category_id: categoryId,
      title: 'Test sofa free pickup',
      description: 'Free sofa, pick up in 2 days. This is a test listing.',
      price: 0.00,
      location: 'Iași',
      phone: testPhone,
      images: JSON.stringify(['https://picsum.photos/seed/3/800/600']),
      status: 'active'
    }
  ];

  const { data, error } = await supabase.from('anunturi').insert(ads).select();

  if (error) {
    console.error('Error inserting ads:', error);
    process.exit(1);
  }

  console.log('Inserted ads:', data.map(d => ({ id: d.id, title: d.title })));
}

postTestAds().catch(err => {
  console.error('Fatal error:', err.message || err);
  process.exit(1);
});
