import { JulesManager } from './src/lib/jules-manager';

async function testUniversalDBIntegration() {
  console.log('🧪 Testing Universal DB MCP Integration...');
  
  const jules = new JulesManager();
  
  try {
    console.log('\n1. Initializing Jules Manager...');
    await jules.initialize();
    console.log('✅ Jules Manager initialized successfully');
    
    console.log('\n2. Checking health status...');
    const health = await jules.healthCheck();
    console.log('🏥 Health status:', health);
    
    console.log('\n3. Testing database tool execution (if available)...');
    if (health['universal_db']) {
      console.log('✅ Universal DB Manager is healthy');
      
      // Test a simple database operation
      try {
        const result = await jules.executeTask('Check database version');
        console.log('📊 Database operation result:', result);
      } catch (error) {
        console.log('⚠️ Database operation failed (expected if no database connection):', error.message);
      }
    } else {
      console.log('⚠️ Universal DB Manager not available - this is expected if no database connection is configured');
    }
    
    console.log('\n4. Testing task routing to database...');
    try {
      // This should route to the database manager
      const routingResult = await jules.executeTask('Find users with name John');
      console.log('🎯 Task routing result:', routingResult);
    } catch (error) {
      console.log('⚠️ Task routing failed (expected if no database connection):', error.message);
    }
    
    console.log('\n✅ Universal DB MCP Integration Test Complete');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    console.log('\n5. Shutting down...');
    await jules.shutdown();
    console.log('✅ Shutdown complete');
  }
}

// Run the test
testUniversalDBIntegration().catch(console.error);
