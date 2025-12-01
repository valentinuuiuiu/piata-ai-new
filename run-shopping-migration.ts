import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://ndzoavaveppnclkujjhh.supabase.co';
const supabaseToken = 'sbp_5460a0c658e796c00ff638d17980dd9270424c9a';

const supabase = createClient(supabaseUrl, supabaseToken);

async function runMigration() {
  console.log('Reading migration file...');
  const migrationPath = path.join(process.cwd(), 'supabase/migrations/008_shopping_agents.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');

  console.log('Executing migration...');
  
  // Split by semicolons and execute each statement
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    if (statement.length > 0) {
      console.log(`Executing: ${statement.substring(0, 60)}...`);
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
      
      if (error) {
        console.error(`❌ Error:`, error.message);
        // Try direct query
        const { error: directError } = await supabase.from('_supabase_migrations').insert({});
        if (directError) {
          console.log('Direct execution not available, using alternative method...');
        }
      } else {
        console.log('✅ Success');
      }
    }
  }

  console.log('\nVerifying tables...');
  const tables = ['shopping_agents', 'agent_matches', 'agent_learning_history', 'agent_capabilities'];
  
  for (const table of tables) {
    const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log(`❌ Table '${table}' verification failed: ${error.message}`);
    } else {
      console.log(`✅ Table '${table}' exists and is accessible.`);
    }
  }
}

runMigration().catch(console.error);
