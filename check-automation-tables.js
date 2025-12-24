
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Match the variables names in the provided .env 
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ndzoavaveppnclkujjhh.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAutomationTables() {
  const tables = ['automation_tasks', 'automation_logs', 'email_campaigns', 'blog_posts'];
  console.log('--- Checking Automation Tables ---');
  for (const table of tables) {
    const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
    if (error) {
      console.log(`❌ Table ${table}: ${error.message}`);
    } else {
      console.log(`✅ Table ${table} exists.`);
    }
  }
}

checkAutomationTables();
