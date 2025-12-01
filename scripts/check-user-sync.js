const { Client } = require('pg');

// Use the database URL from the .env file
const client = new Client({
  connectionString: "postgresql://postgres.ndzoavaveppnclkujjhh:ancutadavid_24A@aws-1-us-east-1.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false }
});

async function checkUserSync() {
  try {
    await client.connect();
    console.log("Connected successfully!");
    
    // Check for triggers on auth schema tables
    console.log("\n1. Checking for triggers on auth tables...");
    const triggerQuery = `
      SELECT 
        trigger_schema,
        trigger_name,
        event_object_table,
        action_timing,
        event_manipulation,
        action_statement
      FROM information_schema.triggers 
      WHERE trigger_schema = 'auth'
      ORDER BY trigger_name
    `;
    const triggerResult = await client.query(triggerQuery);
    
    if (triggerResult.rows.length > 0) {
      console.log("Found triggers in auth schema:");
      triggerResult.rows.forEach(row => {
        console.log(`   - ${row.trigger_name} on ${row.event_object_table} (${row.event_manipulation})`);
        console.log(`     Action: ${row.action_statement.substring(0, 100)}...`);
      });
    } else {
      console.log("No triggers found in auth schema");
    }
    
    // Check for functions that might sync users
    console.log("\n2. Checking for user sync functions...");
    const functionQuery = `
      SELECT 
        routine_schema,
        routine_name,
        routine_type,
        routine_definition
      FROM information_schema.routines 
      WHERE (routine_name ILIKE '%auth%' AND routine_name ILIKE '%user%')
         OR routine_name ILIKE '%sync%'
         OR routine_name ILIKE '%trigger%'
      ORDER BY routine_schema, routine_name
    `;
    const functionResult = await client.query(functionQuery);
    
    if (functionResult.rows.length > 0) {
      console.log("Found potential sync/trigger functions:");
      functionResult.rows.forEach(row => {
        console.log(`   - ${row.routine_schema}.${row.routine_name} (${row.routine_type})`);
      });
    } else {
      console.log("No obvious sync/trigger functions found");
    }
    
    // Check for any functions in pg_temp schema
    console.log("\n3. Checking for functions in pg_temp schema...");
    const pgTempQuery = `
      SELECT proname, provolatile
      FROM pg_proc 
      WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'pg_temp_3')
      ORDER BY proname
    `;
    try {
      const pgTempResult = await client.query(pgTempQuery);
      if (pgTempResult.rows.length > 0) {
        console.log("Found functions in pg_temp schema:");
        pgTempResult.rows.forEach(row => {
          console.log(`   - ${row.proname}`);
        });
      }
    } catch (err) {
      console.log("Could not query pg_temp schema (may not have permissions)");
    }
    
    // Check for any triggers that might be related to user creation
    console.log("\n4. Checking for triggers with 'user' in name...");
    const userTriggerQuery = `
      SELECT 
        trigger_schema,
        trigger_name,
        event_object_table,
        action_timing,
        event_manipulation
      FROM information_schema.triggers 
      WHERE trigger_name ILIKE '%user%'
      ORDER BY trigger_schema, trigger_name
    `;
    const userTriggerResult = await client.query(userTriggerQuery);
    
    if (userTriggerResult.rows.length > 0) {
      console.log("Found triggers with 'user' in name:");
      userTriggerResult.rows.forEach(row => {
        console.log(`   - ${row.trigger_schema}.${row.trigger_name} on ${row.event_object_table} (${row.event_manipulation})`);
      });
    } else {
      console.log("No triggers with 'user' in name found");
    }
    
    // Check for event triggers
    console.log("\n5. Checking for event triggers...");
    const eventTriggerQuery = `
      SELECT evtname, evtevent, evtfoid
      FROM pg_event_trigger
      ORDER BY evtname
    `;
    try {
      const eventTriggerResult = await client.query(eventTriggerQuery);
      if (eventTriggerResult.rows.length > 0) {
        console.log("Found event triggers:");
        eventTriggerResult.rows.forEach(row => {
          console.log(`   - ${row.evtname} (${row.evtevent})`);
        });
      } else {
        console.log("No event triggers found");
      }
    } catch (err) {
      console.log("Could not query event triggers (may not have permissions)");
    }
    
    await client.end();
    console.log("\n✅ Database connection closed");
    
  } catch (err) {
    console.error("❌ Connection failed:", err);
  }
}

checkUserSync();