const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ndzoavaveppnclkujjhh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kem9hdmF2ZXBwbmNsa3VqamhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDM5NzkxMSwiZXhwIjoyMDc5OTczOTExfQ.2d6bkmNV2kIaLLSOzEE0DQ-emoyZBqwMi8s1ZANKM0g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addServicii() {
  // Check if Servicii exists
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'servicii')
    .single();
  
  if (existing) {
    console.log('✅ Servicii category already exists!');
    return;
  }
  
  // Add Servicii category
  const { data: cat, error } = await supabase
    .from('categories')
    .insert({ name: 'Servicii', slug: 'servicii', icon: '🔧' })
    .select()
    .single();
  
  if (error) {
    console.error('Error:', error.message);
    return;
  }
  
  // Add subcategories
  const subcats = [
    'Construcții și renovări',
    'Reparații',
    'Transport',
    'Evenimente și nunți',
    'Curățenie',
    'Frumusețe și wellness',
    'Contabilitate și juridic',
    'IT și web design',
    'Educație și cursuri'
  ].map(name => ({
    category_id: cat.id,
    name,
    slug: name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  }));
  
  await supabase.from('subcategor ies').insert(subcats);
  console.log('✅ Added Servicii category with 9 subcategories');
}

addServicii();
