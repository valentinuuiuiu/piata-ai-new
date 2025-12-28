
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const email = 'ionutbaltag3@gmail.com';
  const phone = '0786538708';

  console.log(`Looking for user: ${email}`);

  // 1. Get User ID
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (userError) {
    console.error('Error finding user:', userError);
    return;
  }

  const userId = users.id;
  console.log(`Found user ${email} with ID: ${userId}`);

  // 2. Insert Ad
  console.log('Inserting test ad for Matrimoniale...');

  const { data, error } = await supabase
    .from('anunturi')
    .insert({
      user_id: userId,
      category_id: 11, // Matrimoniale
      subcategory_id: 40, // Femei caută bărbați
      title: 'Test Ad - Matrimoniale - Do not reply',
      description: 'This is an automated test ad for the Matrimoniale category. We are verifying the category placement and subcategory selection.',
      price: 0,
      location: 'București',
      phone: phone,
      status: 'active',
      contact_email: email
    })
    .select();

  if (error) {
    console.error('Error inserting ad:', error);
  } else {
    console.log('Successfully inserted ad:', data);
  }
}

main();
