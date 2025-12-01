const { Client } = require('pg');

// Use the database URL from the .env file
const client = new Client({
  connectionString: "postgresql://postgres.ndzoavaveppnclkujjhh:ancutadavid_24A@aws-1-us-east-1.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false }
});

async function checkUserSchema() {
  try {
    await client.connect();
    console.log("Connected successfully!");
    
    // Check if user exists in public.users table
    console.log("\n1. Checking public.users table...");
    const publicUserQuery = `
      SELECT id, email, created_at 
      FROM public.users 
      WHERE id = '6191dba1-574a-49eb-a836-b203e858cb71'
    `;
    const publicUserResult = await client.query(publicUserQuery);
    
    if (publicUserResult.rows.length > 0) {
      console.log("✅ User found in public.users table:");
      console.log("   ID:", publicUserResult.rows[0].id);
      console.log("   Email:", publicUserResult.rows[0].email);
      console.log("   Created at:", publicUserResult.rows[0].created_at);
    } else {
      console.log("❌ User NOT found in public.users table");
    }
    
    // Check if user exists in auth.users table
    console.log("\n2. Checking auth.users table...");
    const authUserQuery = `
      SELECT id, email, created_at, last_sign_in_at, raw_user_meta_data
      FROM auth.users 
      WHERE id = '6191dba1-574a-49eb-a836-b203e858cb71'
    `;
    const authUserResult = await client.query(authUserQuery);
    
    if (authUserResult.rows.length > 0) {
      console.log("✅ User found in auth.users table:");
      console.log("   ID:", authUserResult.rows[0].id);
      console.log("   Email:", authUserResult.rows[0].email);
      console.log("   Created at:", authUserResult.rows[0].created_at);
      console.log("   Last sign in:", authUserResult.rows[0].last_sign_in_at);
      console.log("   Metadata:", authUserResult.rows[0].raw_user_meta_data);
    } else {
      console.log("❌ User NOT found in auth.users table");
    }
    
    // Check for triggers or functions that sync auth.users to public.users
    console.log("\n3. Checking for sync functions/triggers...");
    
    // Look for functions with names containing 'auth' or 'user'
    const functionQuery = `
      SELECT routine_name, routine_type, routine_definition
      FROM information_schema.routines 
      WHERE routine_name ILIKE '%auth%' 
         OR routine_name ILIKE '%user%' 
         OR routine_name ILIKE '%sync%'
      ORDER BY routine_name
    `;
    const functionResult = await client.query(functionQuery);
    
    if (functionResult.rows.length > 0) {
      console.log("Found potential sync functions:");
      functionResult.rows.forEach(row => {
        console.log(`   - ${row.routine_name} (${row.routine_type})`);
      });
    } else {
      console.log("No obvious sync functions found by name");
    }
    
    // Check for triggers on auth.users table
    const triggerQuery = `
      SELECT trigger_name, event_manipulation, action_statement
      FROM information_schema.triggers 
      WHERE event_object_table = 'users' 
        AND event_object_schema = 'auth'
      ORDER BY trigger_name
    `;
    const triggerResult = await client.query(triggerQuery);
    
    if (triggerResult.rows.length > 0) {
      console.log("\nFound triggers on auth.users table:");
      triggerResult.rows.forEach(row => {
        console.log(`   - ${row.trigger_name} (${row.event_manipulation})`);
      });
    } else {
      console.log("\nNo triggers found on auth.users table");
    }
    
    // Check for any functions that might be related to user creation
    const onCreateFunctionQuery = `
      SELECT proname, provolatile, prosrc
      FROM pg_proc 
      WHERE proname ILIKE '%on_auth_user%' 
         OR proname ILIKE '%auth_user_created%'
      ORDER BY proname
    `;
    const onCreateFunctionResult = await client.query(onCreateFunctionQuery);
    
    if (onCreateFunctionResult.rows.length > 0) {
      console.log("\nFound 'on_auth_user_created' related functions:");
      onCreateFunctionResult.rows.forEach(row => {
        console.log(`   - ${row.proname}`);
      });
    } else {
      console.log("\nNo 'on_auth_user_created' functions found");
    }
    
    // Check table structures
    console.log("\n4. Checking table structures...");
    
    const publicUsersStructure = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    if (publicUsersStructure.rows.length > 0) {
      console.log("public.users table structure:");
      publicUsersStructure.rows.forEach(row => {
        console.log(`   - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    }
    
    const authUsersStructure = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'auth' AND table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    if (authUsersStructure.rows.length > 0) {
      console.log("\nauth.users table structure:");
      authUsersStructure.rows.forEach(row => {
        console.log(`   - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    }
    
    await client.end();
    console.log("\n✅ Database connection closed");
    
  } catch (err) {
    console.error("❌ Connection failed:", err);
  }
}

checkUserSchema();