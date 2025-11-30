const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ndzoavaveppnclkujjhh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kem9hdmF2ZXBwbmNsa3VqamhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDM5NzkxMSwiZXhwIjoyMDc5OTczOTExfQ.2d6bkmNV2kIaLLSOzEE0DQ-emoyZBqwMi8s1ZANKM0g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanDuplicates() {
  console.log('🧹 Cleaning duplicate and empty categories...\n');
  
  // Categories to delete (old versions with no subcategories)
  const toDelete = [
   'Auto',  // Keep "Auto Moto"
    'Modă',  // Keep "Modă și Accesorii"
    'Sport', // Keep "Sport & Hobby" or "Sport și Timp Liber"
    'Cărți & Muzică',
    'Diverse',
    '18300+ Locuri de munca   • joburi • Angajari' // weird one
  ];
  
  for (const catName of toDelete) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('name', catName);
    
    if (error) {
      console.log(`⚠️  Could not delete "${catName}": ${error.message}`);
    } else {
      console.log(`✅ Deleted: ${catName}`);
    }
  }
  
  // Now add subcategories for "Sport & Hobby" and "Servicii" if they're missing
  console.log('\n📦 Adding missing subcategories...\n');
  
  // Sport & Hobby
  const { data: sportCat } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'sport-hobby')
    .single();
  
  if (sportCat) {
    const sportSubcats = [
      'Biciclete',
      'Echipament fitness',
      'Sporturi de iarnă',
      'Camping și drumeții',
      'Pescuit și vânătoare',
      'Sporturi acvatice',
  'Sporturi cu minge'
    ].map(name => ({
      category_id: sportCat.id,
      name,
      slug: name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    }));
    
    await supabase.from('subcategories').insert(sportSubcats);
    console.log('✅ Added subcategories for Sport & Hobby');
  }
  
  // Servicii
  const { data: serviciiCat } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'servicii')
    .single();
  
  if (serviciiCat) {
    const serviciiSubcats = [
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
      category_id: serviciiCat.id,
      name,
      slug: name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    }));
    
    await supabase.from('subcategories').insert(serviciiSubcats);
    console.log('✅ Added subcategories for Servicii');
  }
  
  console.log('\n✨ Cleanup complete!');
}

cleanDuplicates();
