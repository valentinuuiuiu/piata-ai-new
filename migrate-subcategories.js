#!/usr/bin/env node
/**
 * Migrate Subcategories from Old DB to New DB
 */

const { createClient } = require('@supabase/supabase-js');

// Old database
const OLD_URL = 'https://oikhfoaltormcigauobs.supabase.co';
const OLD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pa2hmb2FsdG9ybWNpZ2F1b2JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNDUyMTEsImV4cCI6MjA3OTcyMTIxMX0.JT6ccPvtNGCGOchk4khJXzrloDMc_ee1tgo07lxlXME';

// New database
const NEW_URL = 'https://ndzoavaveppnclkujjhh.supabase.co';
const NEW_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kem9hdmF2ZXBwbmNsa3VqamhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzOTc5MTEsImV4cCI6MjA3OTk3MzkxMX0._oXCgFOwNA5quaIH8bYTK-Jz5RVKp6pqvkpSNfxs-3o';

const oldSupabase = createClient(OLD_URL, OLD_KEY);
const newSupabase = createClient(NEW_URL, NEW_KEY);

async function migrate() {
  console.log('\n🔄 Starting migration...\n');

  try {
    // Step 1: Get categories from old DB
    console.log('📋 Fetching categories from old database...');
    const { data: oldCategories, error: catError } = await oldSupabase
      .from('categories')
      .select('*')
      .order('id');

    if (catError) throw new Error(`Categories fetch error: ${catError.message}`);
    console.log(`✅ Found ${oldCategories.length} categories`);

    // Step 2: Get subcategories from old DB
    console.log('\n📋 Fetching subcategories from old database...');
    const { data: oldSubcategories, error: subError } = await oldSupabase
      .from('subcategories')
      .select('*')
      .order('category_id', 'id');

    if (subError) throw new Error(`Subcategories fetch error: ${subError.message}`);
    console.log(`✅ Found ${oldSubcategories.length} subcategories`);

    // Step 3: Display data
    console.log('\n📊 Categories:');
    oldCategories.forEach(cat => {
      console.log(`  ${cat.id}. ${cat.name} (${cat.slug})`);
    });

    console.log('\n📊 Subcategories:');
    oldSubcategories.forEach(sub => {
      const cat = oldCategories.find(c => c.id === sub.category_id);
      console.log(`  ${sub.id}. ${sub.name} → Category: ${cat?.name || sub.category_id}`);
    });

    // Step 4: Generate SQL for new database
    console.log('\n\n📝 Generated SQL for NEW database:');
    console.log('─'.repeat(80));

    // Categories SQL
    console.log('\n-- Insert Categories');
    oldCategories.forEach(cat => {
      const name = cat.name.replace(/'/g, "''");
      const slug = cat.slug.replace(/'/g, "''");
      const icon = cat.icon ? `'${cat.icon}'` : 'NULL';
      console.log(`INSERT INTO categories (id, name, slug, icon) VALUES (${cat.id}, '${name}', '${slug}', ${icon}) ON CONFLICT (id) DO NOTHING;`);
    });

    // Subcategories SQL
    console.log('\n-- Insert Subcategories');
    oldSubcategories.forEach(sub => {
      const name = sub.name.replace(/'/g, "''");
      console.log(`INSERT INTO subcategories (id, category_id, name) VALUES (${sub.id}, ${sub.category_id}, '${name}');`);
    });

    console.log('\n─'.repeat(80));
    console.log('\n✅ Migration SQL generated!');
    console.log('\n📋 Next steps:');
    console.log('1. Copy the SQL above');
    console.log('2. Go to: https://supabase.com/dashboard/project/ndzoavaveppnclkujjhh/sql/new');
    console.log('3. First run the migration files (0000_*.sql and 0001_*.sql)');
    console.log('4. Then paste and run the SQL above');
    console.log('');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

migrate();
