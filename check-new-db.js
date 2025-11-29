#!/usr/bin/env node
/**
 * Check New Supabase Database Schema
 * Run with: node check-new-db.js
 */

const { createClient } = require('@supabase/supabase-js');

// New database credentials
const SUPABASE_URL = 'https://ndzoavaveppnclkujjhh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kem9hdmF2ZXBwbmNsa3VqamhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzOTc5MTEsImV4cCI6MjA3OTk3MzkxMX0._oXCgFOwNA5quaIH8bYTK-Jz5RVKp6pqvkpSNfxs-3o';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkDatabase() {
  console.log('\n🔍 Checking NEW Supabase Database...\n');
  console.log('URL:', SUPABASE_URL);
  console.log('─'.repeat(60));

  try {
    // Get all tables
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables');

    if (tablesError) {
      // Fallback: Try to query known tables
      console.log('\n⚠️  Cannot list all tables (need custom function)');
      console.log('Checking known tables instead...\n');

      const knownTables = ['categories', 'subcategories', 'users', 'profiles',
                           'anunturi', 'credit_packages', 'credits_transactions', 'listing_boosts'];

      for (const tableName of knownTables) {
        await checkTable(tableName);
      }
    } else {
      console.log('\n📋 Tables found:', tables.length);
      for (const table of tables) {
        await checkTable(table.table_name);
      }
    }

    console.log('\n─'.repeat(60));
    console.log('✅ Database check complete!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

async function checkTable(tableName) {
  try {
    // Try to count rows
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.code === '42P01') {
        // Table doesn't exist
        return;
      }
      console.log(`\n❌ ${tableName}: Error - ${error.message}`);
    } else {
      console.log(`\n✅ ${tableName}: ${count || 0} rows`);

      // If it's categories or subcategories, show sample data
      if (tableName === 'categories' || tableName === 'subcategories') {
        const { data, error: dataError } = await supabase
          .from(tableName)
          .select('*')
          .limit(5);

        if (!dataError && data && data.length > 0) {
          console.log('   Sample data:');
          data.forEach((row, i) => {
            console.log(`   ${i + 1}.`, JSON.stringify(row, null, 2).replace(/\n/g, '\n      '));
          });
        }
      }
    }
  } catch (err) {
    // Table doesn't exist, skip silently
  }
}

// Run the check
checkDatabase();
