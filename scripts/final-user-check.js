const { Client } = require('pg');

// Use the database URL from the .env file
const client = new Client({
  connectionString: "postgresql://postgres.ndzoavaveppnclkujjhh:ancutadavid_24A@aws-1-us-east-1.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false }
});

async function finalUserCheck() {
  try {
    await client.connect();
    console.log("Connected successfully!");
    
    // Check the specific user in both tables
    console.log("\n=== USER SCHEMA VERIFICATION REPORT ===");
    
    console.log("\n1. USER EXISTENCE CHECK:");
    
    // Check public.users
    const publicUserQuery = `
      SELECT id, email, created_at, name
      FROM public.users 
      WHERE id = '6191dba1-574a-49eb-a836-b203e858cb71'
    `;
    const publicUserResult = await client.query(publicUserQuery);
    
    if (publicUserResult.rows.length > 0) {
      console.log("✅ USER FOUND in public.users table:");
      console.log("   ID:", publicUserResult.rows[0].id);
      console.log("   Email:", publicUserResult.rows[0].email);
      console.log("   Name:", publicUserResult.rows[0].name);
      console.log("   Created at:", publicUserResult.rows[0].created_at);
    } else {
      console.log("❌ USER NOT FOUND in public.users table");
    }
    
    // Check auth.users
    const authUserQuery = `
      SELECT id, email, created_at, last_sign_in_at, raw_user_meta_data
      FROM auth.users 
      WHERE id = '6191dba1-574a-49eb-a836-b203e858cb71'
    `;
    const authUserResult = await client.query(authUserQuery);
    
    if (authUserResult.rows.length > 0) {
      console.log("\n✅ USER FOUND in auth.users table:");
      console.log("   ID:", authUserResult.rows[0].id);
      console.log("   Email:", authUserResult.rows[0].email);
      console.log("   Created at:", authUserResult.rows[0].created_at);
      console.log("   Last sign in:", authUserResult.rows[0].last_sign_in_at);
      console.log("   Metadata:", authUserResult.rows[0].raw_user_meta_data);
    } else {
      console.log("\n❌ USER NOT FOUND in auth.users table");
    }
    
    console.log("\n2. SCHEMA STRUCTURE COMPARISON:");
    
    // Get public.users structure
    const publicStructure = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log("\npublic.users table structure:");
    publicStructure.rows.forEach(row => {
      console.log(`   - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Get auth.users structure
    const authStructure = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'auth' AND table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log("\nauth.users table structure:");
    authStructure.rows.forEach(row => {
      console.log(`   - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    console.log("\n3. USER SYNC MECHANISM CHECK:");
    
    // Check for triggers on auth.users
    const triggerQuery = `
      SELECT tgname, tgfoid::regproc as function_name
      FROM pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE c.relname = 'users' AND n.nspname = 'auth'
    `;
    const triggerResult = await client.query(triggerQuery);
    
    if (triggerResult.rows.length > 0) {
      console.log("Found triggers on auth.users:");
      triggerResult.rows.forEach(row => {
        console.log(`   - ${row.tgname} (function: ${row.function_name})`);
      });
    } else {
      console.log("No triggers found on auth.users table");
    }
    
    // Check for functions with 'on_auth_user' in name
    const functionQuery = `
      SELECT proname, pronamespace::regnamespace as schema_name
      FROM pg_proc
      WHERE proname ILIKE '%on_auth_user%' OR proname ILIKE '%auth_user_created%'
    `;
    const functionResult = await client.query(functionQuery);
    
    if (functionResult.rows.length > 0) {
      console.log("Found potential user sync functions:");
      functionResult.rows.forEach(row => {
        console.log(`   - ${row.schema_name}.${row.proname}`);
      });
    } else {
      console.log("No 'on_auth_user_created' functions found");
    }
    
    console.log("\n4. DATABASE MIGRATION HISTORY:");
    
    // Check if there are any functions that might sync users
    const migrationCheckQuery = `
      SELECT routine_name, routine_schema
      FROM information_schema.routines 
      WHERE routine_name ILIKE '%user%' AND routine_schema IN ('public', 'auth')
    `;
    const migrationCheckResult = await client.query(migrationCheckQuery);
    
    if (migrationCheckResult.rows.length > 0) {
      console.log("User-related functions in database:");
      migrationCheckResult.rows.forEach(row => {
        console.log(`   - ${row.routine_schema}.${row.routine_name}`);
      });
    }
    
    console.log("\n=== FINDINGS SUMMARY ===");
    
    if (publicUserResult.rows.length > 0 && authUserResult.rows.length === 0) {
      console.log("🔍 SCHEMA MISMATCH DETECTED:");
      console.log("   - User exists in application table (public.users)");
      console.log("   - User does NOT exist in authentication table (auth.users)");
      console.log("   - This indicates a synchronization issue between auth and app tables");
      console.log("   - Possible causes:");
      console.log("     1. User was manually inserted into public.users");
      console.log("     2. User sync trigger/function is missing or broken");
      console.log("     3. User was deleted from auth system but remains in app table");
    } else if (publicUserResult.rows.length === 0 && authUserResult.rows.length > 0) {
      console.log("🔍 REVERSE SCHEMA MISMATCH:");
      console.log("   - User exists in authentication table (auth.users)");
      console.log("   - User does NOT exist in application table (public.users)");
      console.log("   - This suggests user sync from auth to public is not working");
    } else if (publicUserResult.rows.length > 0 && authUserResult.rows.length > 0) {
      console.log("✅ USER SYNCHRONIZED:");
      console.log("   - User exists in both auth and application tables");
    } else {
      console.log("❌ USER NOT FOUND:");
      console.log("   - User does not exist in either table");
    }
    
    await client.end();
    console.log("\n✅ Database connection closed");
    
  } catch (err) {
    console.error("❌ Connection failed:", err);
  }
}

finalUserCheck();