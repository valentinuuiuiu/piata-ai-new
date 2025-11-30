const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ndzoavaveppnclkujjhh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kem9hdmF2ZXBwbmNsa3VqamhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDM5NzkxMSwiZXhwIjoyMDc5OTczOTExfQ.2d6bkmNV2kIaLLSOzEE0DQ-emoyZBqwMi8s1ZANKM0g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixServicii() {
  const { data: cat } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'servicii')
    .single();
  
  if (!cat) {
    console.log('❌ Servicii not found');
    return;
  }
  
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
    slug: name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ă/g, 'a').replace(/â/g, 'a').replace(/î/g, 'i').replace(/ș/g, 's').replace(/ț/g, 't').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  }));
  
  const { error } = await supabase.from('subcategories').insert(subcats);
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('✅ Added 9 subcategories for Servicii');
  }
}

fixServicii();
