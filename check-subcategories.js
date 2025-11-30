const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ndzoavaveppnclkujjhh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kem9hdmF2ZXBwbmNsa3VqamhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzOTc5MTEsImV4cCI6MjA3OTk3MzkxMX0._oXCgFOwNA5quaIH8bYTK-Jz5RVKp6pqvkpSNfxs-3o';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSubcategories() {
  console.log('Checking subcategories table...\n');
  
  // Check if table exists and get all subcategories
  const { data: subcats, error: subcatsError, count } = await supabase
    .from('subcategories')
    .select('*', { count: 'exact' });
  
  if (subcatsError) {
    console.error('❌ Error querying subcategories:', subcatsError);
  } else {
    console.log(`✅ Found ${count} subcategories in database`);
    console.log('First 5 subcategories:', JSON.stringify(subcats?.slice(0, 5), null, 2));
  }
  
  console.log('\n---\n');
  
  // Check categories with their subcategories
  const { data: categories, error: catsError } = await supabase
    .from('categories')
    .select(`
      id,
      name,
      slug,
      subcategories (
        id,
        name,
        slug,
        category_id
      )
    `)
    .limit(5);
  
  if (catsError) {
    console.error('❌ Error querying categories:', catsError);
  } else {
    console.log('✅ Categories with subcategories:');
    categories?.forEach(cat => {
      console.log(`\n${cat.name} (${cat.slug}): ${cat.subcategories?.length || 0} subcategories`);
      if (cat.subcategories?.length > 0) {
        cat.subcategories.slice(0, 3).forEach(sub => {
          console.log(`  - ${sub.name} (${sub.slug})`);
        });
      }
    });
  }
}

checkSubcategories().catch(console.error);
