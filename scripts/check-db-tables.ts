import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('Checking database tables...');

  // Try to query a few tables to see if they exist
  // Since we use REST, we can just try to select 1 row from each

  const tables = ['agent_registry', 'a2a_signals', 'marketing_insights', 'anunturi', 'categories'];

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`❌ Table '${table}': FAILED - ${error.message}`);
    } else {
      console.log(`✅ Table '${table}': EXISTS`);
    }
  }
}

checkTables();
