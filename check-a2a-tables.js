
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkA2ATables() {
  const tables = [
    'a2a_signals',
    'agent_learning_history',
    'agent_performance_metrics',
    'agent_registry',
    'signal_replay_sessions',
    'agent_skill_matching'
  ];

  console.log('--- Checking A2A Tables ---');
  for (const table of tables) {
    const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
    if (error) {
      console.log(`❌ Table ${table} does not exist or error:`, error.message);
    } else {
      console.log(`✅ Table ${table} exists.`);
    }
  }
}

checkA2ATables();
