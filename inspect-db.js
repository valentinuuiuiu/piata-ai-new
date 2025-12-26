const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ndzoavaveppnclkujjhh.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectTables() {
  try {
    console.log('=== Checking all users ===');
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('id, email, phone, created_at')
      .limit(10);

    if (usersError) {
      console.error('Error fetching users:', usersError);
    } else {
      console.log('All users:');
      console.log(JSON.stringify(allUsers, null, 2));
    }

    console.log('\n=== Checking anunturi table structure ===');
    const { data: anunturiSample, error: anunturiError } = await supabase
      .from('anunturi')
      .select('*')
      .limit(1);

    if (anunturiError) {
      console.error('Error fetching anunturi:', anunturiError);
    } else {
      console.log('Sample anunturi record:');
      console.log(JSON.stringify(anunturiSample, null, 2));
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

inspectTables();
