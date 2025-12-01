const { Client } = require('pg');

// Use the database URL from the .env file
const client = new Client({
  connectionString: "postgresql://postgres.ndzoavaveppnclkujjhh:ancutadavid_24A@aws-1-us-east-1.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false }
});

async function checkSchemaDetails() {
  try {
    await client.connect();
    console.log("Connected successfully!");
    
    // Check for functions in specific schemas
    console.log("\n1. Checking for functions in auth and public schemas...");
    const functionQuery = `
      SELECT 
        routine_schema,
        routine_name,
        routine_type
      FROM information_schema.routines 
      WHERE routine_schema IN ('auth', 'public', 'extensions')
        AND (routine_name ILIKE '%user%' OR routine_name ILIKE '%auth%' OR routine_name ILIKE '%sync%' OR routine_name ILIKE '%trigger%')
      ORDER BY routine_schema, routine_name
    `;
    const functionResult = await client.query(functionQuery);
    
    if (functionResult.rows.length > 0) {
      console.log("Found functions in auth/public/extensions schemas:");
      const grouped = {};
      functionResult.rows.forEach(row => {
        if (!grouped[row.routine_schema]) {
          grouped[row.routine_schema] = [];
        }
        grouped[row.routine_schema].push(`${row.routine_name} (${row.routine_type})`);
      });
      
      Object.keys(grouped).forEach(schema => {
        console.log(`   ${schema}:`);
        grouped[schema].forEach(func => {
          console.log(`     - ${func}`);
        });
      });
    } else {
      console.log("No relevant functions found in auth/public/extensions schemas");
    }
    
    // Check for specific triggers that might sync users
    console.log("\n2. Checking for specific user sync triggers...");
    const specificTriggerQuery = `
      SELECT 
        tgname,
        tgrelid::regclass as table_name,
        tgfoid::regproc as function_name,
        tgtype
      FROM pg_trigger
      WHERE tgname ILIKE '%user%' OR tgname ILIKE '%auth%' OR tgname ILIKE '%sync%'
      ORDER BY tgname
    `;
    const specificTriggerResult = await client.query(specificTriggerQuery);
    
    if (specificTriggerResult.rows.length > 0) {
      console.log("Found specific triggers:");
      specificTriggerResult.rows.forEach(row => {
        console.log(`   - ${row.tgname} on ${row.table_name} using ${row.function_name}`);
      });
    } else {
      console.log("No specific user sync triggers found");
    }
    
    // Check for all triggers on the auth.users table
    console.log("\n3. Checking all triggers on auth.users table...");
    const allAuthTriggersQuery = `
      SELECT 
        tgname,
        tgfoid::regproc as function_name,
        tgtype
      FROM pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE c.relname = 'users' AND n.nspname = 'auth'
      ORDER BY tgname
    `;
    const allAuthTriggersResult = await client.query(allAuthTriggersQuery);
    
    if (allAuthTriggersResult.rows.length > 0) {
      console.log("Found triggers on auth.users table:");
      allAuthTriggersResult.rows.forEach(row => {
        console.log(`   - ${row.tgname} using ${row.function_name}`);
      });
    } else {
      console.log("No triggers found on auth.users table");
    }
    
    // Check for functions that might be used for syncing
    console.log("\n4. Checking for functions that might sync users...");
    const syncFunctionQuery = `
      SELECT 
        proname,
        pronamespace::regnamespace as schema_name,
        prosrc
      FROM pg_proc
      WHERE proname ILIKE '%user%' 
        AND proname ILIKE '%create%'
        OR proname ILIKE '%sync%'
        OR proname ILIKE '%auth%'
      ORDER BY pronamespace::regnamespace, proname
      LIMIT 10
    `;
    const syncFunctionResult = await client.query(syncFunctionQuery);
    
    if (syncFunctionResult.rows.length > 0) {
      console.log("Found potential sync/create functions:");
      syncFunctionResult.rows.forEach(row => {
        console.log(`   - ${row.schema_name}.${row.proname}`);
        // Show first 100 characters of the function source
        if (row.prosrc) {
          console.log(`     Source preview: ${row.prosrc.substring(0, 100)}...`);
        }
      });
    } else {
      console.log("No obvious sync/create functions found");
    }
    
    await client.end();
    console.log("\n✅ Database connection closed");
    
  } catch (err) {
    console.error("❌ Connection failed:", err);
  }
}

checkSchemaDetails();