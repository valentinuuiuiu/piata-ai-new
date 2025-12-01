import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://ndzoavaveppnclkujjhh.supabase.co';
const supabaseToken = 'sbp_5460a0c658e796c00ff638d17980dd9270424c9a';

const supabase = createClient(supabaseUrl, supabaseToken, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  db: {
    schema: 'public'
  }
});

async function createTablesDirectly() {
  console.log('Creating tables using direct SQL execution...\n');

  // Create tables one by one
  const tables = [
    {
      name: 'shopping_agents',
      sql: `
        CREATE TABLE IF NOT EXISTS shopping_agents (
          id BIGSERIAL PRIMARY KEY,
          user_id UUID NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          filters JSONB DEFAULT '{}'::jsonb,
          is_active BOOLEAN DEFAULT true,
          last_checked_at TIMESTAMP WITH TIME ZONE,
          matches_found INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    },
    {
      name: 'agent_matches',
      sql: `
        CREATE TABLE IF NOT EXISTS agent_matches (
          id BIGSERIAL PRIMARY KEY,
          agent_id BIGINT NOT NULL,
          listing_id BIGINT,
          external_url TEXT,
          title TEXT NOT NULL,
          price NUMERIC,
          location TEXT,
          match_score INTEGER DEFAULT 50,
          notified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    },
    {
      name: 'agent_learning_history',
      sql: `
        CREATE TABLE IF NOT EXISTS agent_learning_history (
          id BIGSERIAL PRIMARY KEY,
          agent_name TEXT NOT NULL,
          task_description TEXT NOT NULL,
          input_data JSONB DEFAULT '{}'::jsonb,
          output_data JSONB DEFAULT '{}'::jsonb,
          success BOOLEAN DEFAULT true,
          feedback TEXT,
          performance_score INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    },
    {
      name: 'agent_capabilities',
      sql: `
        CREATE TABLE IF NOT EXISTS agent_capabilities (
          id BIGSERIAL PRIMARY KEY,
          agent_name TEXT NOT NULL,
          capability_name TEXT NOT NULL,
          capability_description TEXT,
          proficiency_level INTEGER DEFAULT 50,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    }
  ];

  // Try to create tables by inserting test data (this will fail but might create the table)
  for (const table of tables) {
    console.log(`Attempting to create table: ${table.name}`);
    
    // Try a simple query to check if table exists
    const { error: selectError } = await supabase
      .from(table.name)
      .select('count', { count: 'exact', head: true });
    
    if (!selectError) {
      console.log(`✅ Table '${table.name}' already exists`);
    } else {
      console.log(`❌ Table '${table.name}' does not exist. Error: ${selectError.message}`);
      console.log(`   You need to run this SQL in Supabase Dashboard:\n${table.sql}\n`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('MANUAL MIGRATION REQUIRED');
  console.log('='.repeat(80));
  console.log('\nPlease go to Supabase Dashboard > SQL Editor and run:');
  console.log('supabase/migrations/008_shopping_agents.sql\n');
}

createTablesDirectly();
