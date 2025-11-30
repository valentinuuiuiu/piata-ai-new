#!/usr/bin/env node
/**
 * Check what tables exist in OLD database
 */
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://oikhfoaltormcigauobs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pa2hmb2FsdG9ybWNpZ2F1b2JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNDUyMTEsImV4cCI6MjA3OTcyMTIxMX0.JT6ccPvtNGCGOchk4khJXzrloDMc_ee1tgo07lxlXME'
);

async function checkTables() {
  console.log('Checking old database for all tables...\n');

  const tables = [
    'users', 'categories', 'subcategories', 'anunturi',
    'user_profiles', 'credit_packages', 'credits_transactions',
    'listing_boosts', 'profiles', 'blog_posts', 'comments',
    'messages', 'favorites', 'notifications', 'reports'
  ];

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (!error) {
        console.log(`✅ ${table}: ${count} rows`);
      }
    } catch (e) {
      // Table doesn't exist
    }
  }
}

checkTables();
