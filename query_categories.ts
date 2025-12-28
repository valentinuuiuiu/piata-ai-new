
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
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

  console.log('Categories:', categories);

  console.log('Fetching subcategories...');
  const { data: subcategories, error: subError } = await supabase
    .from('subcategories')
    .select('*')
    .order('category_id');

  if (subError) {
    console.error('Error fetching subcategories:', subError);
    return;
  }

  console.log('Subcategories:', subcategories);
}

main();
