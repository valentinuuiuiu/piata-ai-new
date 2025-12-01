const { Client } = require('pg');

// Use the database URL from the .env file
const client = new Client({
  connectionString: "postgresql://postgres.ndzoavaveppnclkujjhh:ancutadavid_24A@aws-1-us-east-1.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false }
});

async function verifyUserSync() {
  try {
    await client.connect();
    console.log("Connected successfully!");
    
    console.log("\n=== USER SYNCHRONIZATION VERIFICATION ===");
    
    // Check the specific user that was fixed
    console.log("\n1. Verifying fixed user (6191dba1-574a-49eb-a836-b203e858cb71):");
    
    const userCheckQuery = `
      SELECT 
        pu.id,
        pu.email as public_email,
        pu.name as public_name,
        au.email as auth_email,
        au.created_at as auth_created_at,
        up.credits_balance
      FROM public.users pu
      LEFT JOIN auth.users au ON pu.id = au.id
      LEFT JOIN public.user_profiles up ON pu.id = up.user_id
      WHERE pu.id = '6191dba1-574a-49eb-a836-b203e858cb71'
    `;
    const userCheckResult = await client.query(userCheckQuery);
    
    if (userCheckResult.rows.length > 0) {
      const row = userCheckResult.rows[0];
      console.log("   Public users table:");
      console.log("     ID:", row.id);
      console.log("     Email:", row.public_email);
      console.log("     Name:", row.public_name);
      
      console.log("   Auth users table:");
      if (row.auth_email) {
        console.log("     ✅ Email:", row.auth_email);
        console.log("     ✅ Created at:", row.auth_created_at);
      } else {
        console.log("     ❌ User NOT found in auth.users");
      }
      
      console.log("   User profiles table:");
      console.log("     Credits balance:", row.credits_balance);
      
      if (row.auth_email) {
        console.log("   🎉 USER SYNCHRONIZATION SUCCESSFUL");
      } else {
        console.log("   ❌ USER SYNCHRONIZATION FAILED");
      }
    } else {
      console.log("   ❌ User not found in public.users");
    }
    
    // Check for any remaining orphaned users
    console.log("\n2. Checking for remaining orphaned users:");
    
    const orphanedCheckQuery = `
      SELECT 
        COUNT(*) as orphaned_count
      FROM public.users pu
      WHERE NOT EXISTS (
        SELECT 1 FROM auth.users au WHERE au.id = pu.id
      )
    `;
    const orphanedCheckResult = await client.query(orphanedCheckQuery);
    
    const orphanedCount = parseInt(orphanedCheckResult.rows[0].orphaned_count);
    if (orphanedCount === 0) {
      console.log("   ✅ No orphaned users found - all users synchronized");
    } else {
      console.log(`   ⚠️  ${orphanedCount} orphaned users still exist`);
    }
    
    // Check if the sync trigger is working
    console.log("\n3. Verifying sync trigger exists:");
    
    const triggerCheckQuery = `
      SELECT tgname, tgfoid::regproc as function_name
      FROM pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE c.relname = 'users' AND n.nspname = 'public'
      AND tgname = 'sync_user_to_auth_trigger'
    `;
    const triggerCheckResult = await client.query(triggerCheckQuery);
    
    if (triggerCheckResult.rows.length > 0) {
      console.log("   ✅ User sync trigger is active:");
      triggerCheckResult.rows.forEach(row => {
        console.log(`     - ${row.tgname} (function: ${row.function_name})`);
      });
    } else {
      console.log("   ❌ User sync trigger not found");
    }
    
    // Check if the sync functions exist
    console.log("\n4. Verifying sync functions exist:");
    
    const functionCheckQuery = `
      SELECT proname
      FROM pg_proc
      WHERE proname IN ('sync_user_to_auth', 'sync_all_orphaned_users', 'on_public_user_created')
    `;
    const functionCheckResult = await client.query(functionCheckQuery);
    
    const expectedFunctions = ['sync_user_to_auth', 'sync_all_orphaned_users', 'on_public_user_created'];
    const foundFunctions = functionCheckResult.rows.map(row => row.proname);
    
    expectedFunctions.forEach(func => {
      if (foundFunctions.includes(func)) {
        console.log(`   ✅ Function ${func} exists`);
      } else {
        console.log(`   ❌ Function ${func} missing`);
      }
    });
    
    console.log("\n=== VERIFICATION COMPLETE ===");
    
    await client.end();
    console.log("✅ Database connection closed");
    
  } catch (err) {
    console.error("❌ Verification failed:", err);
  }
}

verifyUserSync();