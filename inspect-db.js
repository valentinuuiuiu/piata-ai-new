const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ndzoavaveppnclkujjhh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kem9hdmF2ZXBwbmNsa3VqamhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDM5NzkxMSwiZXhwIjoyMDc5OTczOTExfQ.2d6bkmNV2kIaLLSOzEE0DQ-emoyZBqwMi8s1ZANKM0g';

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
