require('dotenv').config({ path: '.env.jules' });

const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

async function verifyConnections() {
  // Test Supabase connection
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY // Use the service role key for admin-level access
    );

    const { data, error } = await supabase
      .from('automation_logs')
      .select('*')
      .limit(1);

    if (error) {
      throw error;
    }

    console.log('Supabase connection successful. ✅');
    console.log('Sample data from automation_logs:', data);
  } catch (error) {
    console.error('Supabase connection failed. ❌');
    console.error('Error details:', error.message);
  }

  // Test Resend connection
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    // The getDomains function is a simple way to test the API key
    await resend.domains.list();
    console.log('Resend API key is valid. ✅');
  } catch (error) {
    console.error('Resend API key is invalid. ❌');
    console.error('Error details:', error.message);
  }
}

verifyConnections();
