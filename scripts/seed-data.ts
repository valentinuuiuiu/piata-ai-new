import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Use Service Role Key for seeding to bypass RLS
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kem9hdmF2ZXBwbmNsa3VqamhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDM5NzkxMSwiZXhwIjoyMDc5OTczOTExfQ.2d6bkmNV2kIaLLSOzEE0DQ-emoyZBqwMi8s1ZANKM0g";

const supabase = createClient(supabaseUrl, supabaseKey);

const categories = [
  { name: 'Imobiliare', slug: 'imobiliare', icon: '🏠', subcategories: ['Apartamente', 'Case', 'Terenuri', 'Comercial'] },
  { name: 'Auto', slug: 'auto', icon: '🚗', subcategories: ['Autoturisme', 'Autoutilitare', 'Camioane', 'Piese Auto'] },
  { name: 'Electronice', slug: 'electronice', icon: '📱', subcategories: ['Telefoane', 'Laptopuri', 'TV & Audio', 'Electrocasnice'] },
  { name: 'Modă', slug: 'moda', icon: '👕', subcategories: ['Haine Bărbați', 'Haine Dama', 'Încălțăminte', 'Accesorii'] },
  { name: 'Casă și Grădină', slug: 'casa-gradina', icon: '🏡', subcategories: ['Mobilă', 'Grădină', 'Bricolaj', 'Decorațiuni'] },
  { name: 'Sport', slug: 'sport', icon: '⚽', subcategories: ['Biciclete', 'Echipament Sportiv', 'Camping', 'Fitness'] },
  { name: 'Servicii', slug: 'servicii', icon: '🔧', subcategories: ['Constructii', 'Reparatii', 'Transport', 'Cursuri'] },
];

async function seed() {
  console.log('Seeding categories...');

  for (const cat of categories) {
    const { data: catData, error: catError } = await supabase
      .from('categories')
      .insert({ name: cat.name, slug: cat.slug, icon: cat.icon })
      .select()
      .single();

    if (catError) {
      console.error(`Error inserting category ${cat.name}:`, catError.message);
      continue;
    }

    console.log(`Inserted category: ${cat.name}`);

    if (cat.subcategories.length > 0) {
      const subcats = cat.subcategories.map(name => ({
        category_id: catData.id,
        name: name
      }));

      const { error: subError } = await supabase
        .from('subcategories')
        .insert(subcats);
      
      if (subError) {
        console.error(`Error inserting subcategories for ${cat.name}:`, subError.message);
      } else {
        console.log(`Inserted ${cat.subcategories.length} subcategories for ${cat.name}`);
      }
    }
  }

  console.log('Seeding complete!');
}

seed();
