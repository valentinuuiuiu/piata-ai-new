const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ndzoavaveppnclkujjhh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kem9hdmF2ZXBwbmNsa3VqamhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDM5NzkxMSwiZXhwIjoyMDc5OTczOTExfQ.2d6bkmNV2kIaLLSOzEE0DQ-emoyZBqwMi8s1ZANKM0g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTests() {
  try {
    console.log('=== Querying users table ===');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, phone')
      .limit(1);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }

    if (!users || users.length === 0) {
      console.log('No users found in the database');
      return;
    }

    const user = users[0];
    console.log('Found user:', { id: user.id, email: user.email, phone: user.phone });

    console.log('\n=== Querying categories table ===');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id')
      .limit(1);

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      return;
    }

    if (!categories || categories.length === 0) {
      console.log('No categories found in the database');
      return;
    }

    const category = categories[0];
    console.log('Found category:', { id: category.id });

    console.log('\n=== Inserting test ads ===');
    const testAds = [
      {
        user_id: user.id,
        category_id: category.id,
        title: 'Test bike for sale',
        description: 'A used bicycle in good condition, perfect for city commuting.',
        price: 120.00,
        location: 'București',
        phone: '+40123456789',
        images: [],
        status: 'active'
      },
      {
        user_id: user.id,
        category_id: category.id,
        title: 'Test piano lessons',
        description: 'Professional piano lessons for beginners and intermediate students.',
        price: 30.00,
        location: 'Cluj-Napoca',
        phone: '+40123456789',
        images: [],
        status: 'active'
      },
      {
        user_id: user.id,
        category_id: category.id,
        title: 'Test sofa free pickup',
        description: 'Free sofa, needs to be picked up by November 30. Must go ASAP.',
        price: 0.00,
        location: 'Iași',
        phone: '+40123456789',
        images: [],
        status: 'active'
      }
    ];

    const { data: insertedAds, error: insertError } = await supabase
      .from('anunturi')
      .insert(testAds)
      .select('id');

    if (insertError) {
      console.error('Error inserting ads:', insertError);
      return;
    }

    console.log('\n=== SUCCESS ===');
    console.log('User ID used:', user.id);
    console.log('User email:', user.email);
    console.log('Category ID used:', category.id);
    console.log('\nInserted ad IDs:');
    insertedAds.forEach((ad, index) => {
      console.log(`  ${index + 1}. ${ad.id}`);
    });

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

runTests();
