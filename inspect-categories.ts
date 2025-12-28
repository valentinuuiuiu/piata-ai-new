
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  console.log('URL:', supabaseUrl);
  console.log('Key exists:', !!supabaseKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Fetching categories...');
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .order('id');

  if (catError) {
    console.error('Error fetching categories:', catError);
    return;
  }

  console.log('Current Categories:');
  categories.forEach(cat => {
    console.log(`${cat.id}: ${cat.name} (${cat.slug})`);
  });

  console.log('\nFetching subcategories for ID 11...');
  const { data: subcategories, error: subError } = await supabase
    .from('subcategories')
    .select('*')
    .eq('category_id', 11)
    .order('id');

  if (subError) {
    console.error('Error fetching subcategories:', subError);
    return;
  }

  console.log('Subcategories for ID 11:');
  subcategories.forEach(sub => {
    console.log(`${sub.id}: ${sub.name}`);
  });
}

main();
