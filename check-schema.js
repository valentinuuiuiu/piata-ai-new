const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ndzoavaveppnclkujjhh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kem9hdmF2ZXBwbmNsa3VqamhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzOTc5MTEsImV4cCI6MjA3OTk3MzkxMX0._oXCgFOwNA5quaIH8bYTK-Jz5RVKp6pqvkpSNfxs-3o';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  // Get one subcategory to see all columns
  const { data, error } = await supabase
    .from('subcategories')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Error:', error);
  } else if (data && data.length > 0) {
    console.log('Subcategories table columns:');
    console.log(Object.keys(data[0]));
    console.log('\nSample record:');
    console.log(JSON.stringify(data[0], null, 2));
  }
}

checkSchema();
