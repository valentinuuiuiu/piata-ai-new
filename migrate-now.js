#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');

// Old DB
const oldDB = createClient(
  'https://oikhfoaltormcigauobs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pa2hmb2FsdG9ybWNpZ2F1b2JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNDUyMTEsImV4cCI6MjA3OTcyMTIxMX0.JT6ccPvtNGCGOchk4khJXzrloDMc_ee1tgo07lxlXME'
);

// New DB
const newDB = createClient(
  'https://ndzoavaveppnclkujjhh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kem9hdmF2ZXBwbmNsa3VqamhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzOTc5MTEsImV4cCI6MjA3OTk3MzkxMX0._oXCgFOwNA5quaIH8bYTK-Jz5RVKp6pqvkpSNfxs-3o'
);

async function migrate() {
  console.log('🚀 Starting migration...\n');

  // 1. Fetch from old DB
  console.log('📥 Fetching categories from old DB...');
  const { data: categories, error: catErr } = await oldDB.from('categories').select('*');
  if (catErr) throw catErr;
  console.log(`✅ Got ${categories.length} categories\n`);

  console.log('📥 Fetching subcategories from old DB...');
  const { data: subcategories, error: subErr } = await oldDB.from('subcategories').select('*');
  if (subErr) throw subErr;
  console.log(`✅ Got ${subcategories.length} subcategories\n`);

  // 2. Insert into new DB
  console.log('📤 Inserting categories into new DB...');
  for (const cat of categories) {
    const { error } = await newDB.from('categories').insert(cat);
    if (error && !error.message.includes('duplicate')) {
      console.error(`❌ Error inserting category ${cat.name}:`, error.message);
    } else {
      console.log(`✅ ${cat.name}`);
    }
  }

  console.log('\n📤 Inserting subcategories into new DB...');
  for (const sub of subcategories) {
    const { error } = await newDB.from('subcategories').insert(sub);
    if (error && !error.message.includes('duplicate')) {
      console.error(`❌ Error inserting subcategory ${sub.name}:`, error.message);
    } else {
      console.log(`✅ ${sub.name}`);
    }
  }

  console.log('\n✅ Migration complete!');
}

migrate().catch(console.error);
