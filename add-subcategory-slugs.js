const { createClient } = require('@supabase/supabase-js');

// Use service role key for admin operations
const supabaseUrl = 'https://ndzoavaveppnclkujjhh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kem9hdmF2ZXBwbmNsa3VqamhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzOTc5MTEsImV4cCI6MjA3OTk3MzkxMX0._oXCgFOwNA5quaIH8bYTK-Jz5RVKp6pqvkpSNfxs-3o';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to create a slug from a name
function createSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD') // Normalize accents
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/ă/g, 'a')
    .replace(/â/g, 'a')
    .replace(/î/g, 'i')
    .replace(/ș/g, 's')
    .replace(/ț/g, 't')
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ''); // Trim hyphens
}

async function addSlugColumn() {
  console.log('This script will guide you to add the slug column to subcategories table...\n');
  
  console.log('Step 1: Run this SQL in your Supabase SQL Editor:');
  console.log('----------------------------------------');
  console.log(`
-- Add slug column to subcategories table
ALTER TABLE subcategories 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_subcategories_slug 
ON subcategories(slug);
  `);
  console.log('----------------------------------------\n');
  
  console.log('Step 2: After running the SQL above, run this script again with the --populate flag\n');
  
  // If --populate flag is provided, populate slugs
  if (process.argv.includes('--populate')) {
    console.log('Populating slugs for all subcategories...\n');
    
    // Get all subcategories
    const { data: subcats, error } = await supabase
      .from('subcategories')
      .select('id, name')
      .is('slug', null);
    
    if (error) {
      console.error('❌ Error fetching subcategories:', error);
      return;
    }
    
    console.log(`Found ${subcats.length} subcategories without slugs`);
    
    // Update each subcategory with a slug
    let updated = 0;
    let failed = 0;
    
    for (const subcat of subcats) {
      const slug = createSlug(subcat.name);
      
      const { error: updateError } = await supabase
        .from('subcategories')
        .update({ slug })
        .eq('id', subcat.id);
      
      if (updateError) {
        console.error(`❌ Failed to update ${subcat.name}:`, updateError.message);
        failed++;
      } else {
        updated++;
        if (updated % 50 === 0) {
          console.log(`  Updated ${updated}/${subcats.length}...`);
        }
      }
    }
    
    console.log(`\n✅ Successfully updated ${updated} subcategories`);
    if (failed > 0) {
      console.log(`❌ Failed to update ${failed} subcategories`);
    }
  }
}

addSlugColumn().catch(console.error);
