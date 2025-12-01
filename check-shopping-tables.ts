
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ndzoavaveppnclkujjhh.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sbp_5460a0c658e796c00ff638d17980dd9270424c9a';

console.log(`Using Supabase URL: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  const tables = ['shopping_agents', 'agent_matches', 'agent_learning_history', 'agent_capabilities'];
  
  console.log('Checking tables...');
  
  for (const table of tables) {
    const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log(`❌ Table '${table}' does NOT exist or is not accessible. Error: ${error.message}`);
    } else {
      console.log(`✅ Table '${table}' exists.`);
    }
  }
}

checkTables();
