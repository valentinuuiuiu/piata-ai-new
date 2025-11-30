const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ndzoavaveppnclkujjhh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kem9hdmF2ZXBwbmNsa3VqamhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzOTc5MTEsImV4cCI6MjA3OTk3MzkxMX0._oXCgFOwNA5quaIH8bYTK-Jz5RVKp6pqvkpSNfxs-3o';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  const { data: categories } = await supabase
    .from('categories')
    .select(`
      id,
      name,
      slug,
      icon,
      subcategories (count)
    `)
    .order('id');
  
  console.log('\n📊 Categories and Subcategory Counts:\n');
  categories?.forEach(cat => {
    const count = cat.subcategories?.[0]?.count || 0;
    console.log(`${cat.icon} ${cat.name.padEnd(25)} → ${count} subcategories`);
  });
  
  const { count: totalSubcats } = await supabase
    .from('subcategories')
    .select('*', { count: 'exact', head: true });
  
  console.log(`\n✅ Total subcategories: ${totalSubcats}`);
}

verify();
