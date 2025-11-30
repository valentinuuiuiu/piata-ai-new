import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kem9hdmF2ZXBwbmNsa3VqamhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDM5NzkxMSwiZXhwIjoyMDc5OTczOTExfQ.2d6bkmNV2kIaLLSOzEE0DQ-emoyZBqwMi8s1ZANKM0g";

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to create slug
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ă/g, 'a')
    .replace(/â/g, 'a')
    .replace(/î/g, 'i')
    .replace(/ș/g, 's')
    .replace(/ț/g, 't')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const categories = [
  // Existing categories (updated)
  { 
    name: 'Imobiliare', 
    slug: 'imobiliare', 
    icon: '🏠', 
    subcategories: [
      'Apartamente de vânzare',
      'Apartamente de închiriat',
      'Case și Vile de vânzare',
      'Case și Vile de închiriat',
      'Terenuri',
      'Spații comerciale',
      'Garaje și Parcări',
      'Camere de închiriat'
    ] 
  },
  { 
    name: 'Auto Moto', 
    slug: 'auto-moto', 
    icon: '🚗', 
    subcategories: [
      'Autoturisme',
      'Autoutilitare și Camioane',
      'SUV și Off-Road',
      'Motociclete',
      'ATV și UTV',
      'Piese auto',
      'Anvelope și Jante',
      'Accesorii auto',
      'Utilaje agricole',
      'Utilaje construcții'
    ] 
  },
  { 
    name: 'Electronice', 
    slug: 'electronice', 
    icon: '📱', 
    subcategories: [
      'Telefoane mobile',
      'Tablete',
      'Laptopuri',
      'Calculatoare Desktop',
      'Componente PC',
      'TV și Audio',
      'Console și Jocuri',
      'Electrocasnice mari',
      'Electrocasnice mici',
      'Aparate foto și video'
    ] 
  },
  { 
    name: 'Modă și Accesorii', 
    slug: 'moda-accesorii', 
    icon: '👗', 
    subcategories: [
      'Haine femei',
      'Haine bărbați',
      'Încălțăminte femei',
      'Încălțăminte bărbați',
      'Genți și Rucsacuri',
      'Accesorii',
      'Bijuterii și Ceasuri',
      'Ochelari'
    ] 
  },
  { 
    name: 'Casă și Grădină', 
    slug: 'casa-gradina', 
    icon: '🏡', 
    subcategories: [
      'Mobilă living',
      'Mobilă dormitor',
      'Mobilă bucătărie',
      'Decorațiuni',
      'Textile casă',
      'Grădină și exterior',
      'Scule și unelte',
      'Bricolaj'
    ] 
  },
  { 
    name: 'Sport și Timp Liber', 
    slug: 'sport-timp-liber', 
    icon: '⚽', 
    subcategories: [
      'Biciclete',
      'Echipament fitness',
      'Sporturi de iarnă',
      'Camping și drumeții',
      'Pescuit și vânătoare',
      'Sporturi acvatice',
      'Sporturi cu minge'
    ] 
  },
  { 
    name: 'Servicii', 
    slug: 'servicii', 
    icon: '🔧', 
    subcategories: [
      'Construcții și renovări',
      'Reparații',
      'Transport',
      'Evenimente și nunți',
      'Curățenie',
      'Frumusețe și wellness',
      'Contabilitate și juridic',
      'IT și web design',
      'Educație și cursuri'
    ] 
  },

  // NEW CATEGORIES
  { 
    name: 'Locuri de Muncă', 
    slug: 'locuri-munca', 
    icon: '💼', 
    subcategories: [
      'IT și Software',
      'Vânzări și Marketing',
      'Administrație și Birou',
      'Construcții',
      'Producție și Operațiuni',
      'Horeca',
      'Transport și Logistică',
      'Sănătate',
      'Învățământ',
      'Alte joburi'
    ] 
  },
  { 
    name: 'Matrimoniale', 
    slug: 'matrimoniale', 
    icon: '💑', 
    subcategories: [
      'Ea caută El',
      'El caută Ea',
      'Prietenie',
      'Relații serioase'
    ] 
  },
  { 
    name: 'Animale', 
    slug: 'animale', 
    icon: '🐾', 
    subcategories: [
      'Câini',
      'Pisici',
      'Păsări',
      'Acvarii și pești',
      'Rozătoare și iepuri',
      'Animale de fermă',
      'Accesorii animale'
    ] 
  },
  { 
    name: 'Mama și Copilul', 
    slug: 'mama-copilul', 
    icon: '👶', 
    subcategories: [
      'Hăinuțe copii 0-2 ani',
      'Hăinuțe copii 2+ ani',
      'Încălțăminte copii',
      'Cărucioare și scaune auto',
      'Mobilier copii',
      'Jucării',
      'Cărți pentru copii',
      'Articole maternitate'
    ] 
  },
  { 
    name: 'Cazare și Turism', 
    slug: 'cazare-turism', 
    icon: '✈️', 
    subcategories: [
      'Cazare la mare',
      'Cazare la munte',
      'Cazare în oraș',
      'Turism extern',
      'Turism intern',
      'Închirieri vacanță'
    ] 
  },
];

async function seedComplete() {
  console.log('🚀 Starting complete database seeding...\n');

  // Step 1: Clean subcategories table
  console.log('🗑️  STEP 1: Cleaning subcategories table...');
  const { error: deleteError } = await supabase
    .from('subcategories')
    .delete()
    .neq('id', 0); // Delete all records

  if (deleteError) {
    console.error('Error deleting subcategories:', deleteError.message);
  } else {
    console.log('✅ Deleted all old subcategories\n');
  }

  // Step 2: Add new categories and update existing ones
  console.log('📦 STEP 2: Adding/Updating categories...');
  
  for (const cat of categories) {
    // Check if category exists
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', cat.slug)
      .single();

    let categoryId: number;

    if (existing) {
      // Update existing category
      const { data: updated, error } = await supabase
        .from('categories')
        .update({ name: cat.name, icon: cat.icon })
        .eq('slug', cat.slug)
        .select()
        .single();

      if (error) {
        console.error(`Error updating category ${cat.name}:`, error.message);
        continue;
      }
      categoryId = updated.id;
      console.log(`✅ Updated category: ${cat.name}`);
    } else {
      // Insert new category
      const { data: inserted, error } = await supabase
        .from('categories')
        .insert({ name: cat.name, slug: cat.slug, icon: cat.icon })
        .select()
        .single();

      if (error) {
        console.error(`Error inserting category ${cat.name}:`, error.message);
        continue;
      }
      categoryId = inserted.id;
      console.log(`✅ Added NEW category: ${cat.name}`);
    }

    // Step 3: Add subcategories for this category
    if (cat.subcategories.length > 0) {
      const subcats = cat.subcategories.map(name => ({
        category_id: categoryId,
        name: name,
        slug: createSlug(name)
      }));

      const { error: subError } = await supabase
        .from('subcategories')
        .insert(subcats);
      
      if (subError) {
        console.error(`Error inserting subcategories for ${cat.name}:`, subError.message);
      } else {
        console.log(`   → Added ${cat.subcategories.length} subcategories`);
      }
    }
  }

  // Step 4: Summary
  console.log('\n📊 SUMMARY:');
  const { count: categoryCount } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true });
  
  const { count: subcategoryCount } = await supabase
    .from('subcategories')
    .select('*', { count: 'exact', head: true });

  console.log(`✅ Total categories: ${categoryCount}`);
  console.log(`✅ Total subcategories: ${subcategoryCount}`);
  console.log('\n🎉 Seeding complete!');
}

seedComplete();
