
const { createClient } = require('@supabase/supabase-js');
const { GoogleSheetsIntegration } = require('./src/lib/google-sheets-integration');
const fs = require('fs');
const dotenv = require('dotenv');

// Load .env explicitly
const envConfig = dotenv.parse(fs.readFileSync('.env'));
const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Load .env.local for Google keys
const localEnv = dotenv.parse(fs.readFileSync('.env.local'));
const googleApiKey = localEnv.GOOGLE_API_KEY;
const spreadsheetId = localEnv.GOOGLE_SHEETS_ID;

const supabase = createClient(supabaseUrl, supabaseKey);

async function generatePoWReport() {
  console.log('🧐 [Ay]: Generating Proof-of-Work report...');
  
  // Get latest automation logs
  const { data: logs, error } = await supabase
    .from('automation_logs')
    .select('*')
    .order('execution_time', { ascending: false })
    .limit(10);
    
  if (error) {
    console.error('❌ Failed to fetch logs:', error.message);
    return;
  }
  
  if (!logs || logs.length === 0) {
    console.log('ℹ️ No recent PoW logs found.');
    return;
  }
  
  // TOON Summary
  const report = logs.map(l => ({
    id: l.task_id,
    st: l.status,
    ts: l.execution_time,
    dur: l.execution_duration_ms
  }));
  
  console.log('📝 TOON PoW Summary:', JSON.stringify(report));
  
  if (googleApiKey && spreadsheetId) {
    const sheets = new GoogleSheetsIntegration(googleApiKey, spreadsheetId);
    // Push to a specialized "PoW" sheet
    try {
      await sheets.recordTransaction({
        id: `POW_${Date.now()}`,
        date: new Date().toISOString(),
        customerEmail: 'system@piata-ai.ro',
        amount: logs.length,
        currency: 'TASKS',
        status: 'completed',
        paymentMethod: 'AI_AGENT',
        product: 'Automation Proof-of-Work',
        description: JSON.stringify(report)
      });
      console.log('✅ PoW report pushed to Google Sheets.');
    } catch (err) {
      console.error('❌ Failed to push to Sheets:', err.message);
    }
  } else {
    console.log('⚠️ Google Sheets credentials missing skipping push.');
  }
}

generatePoWReport();
