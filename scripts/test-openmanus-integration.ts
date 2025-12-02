import { OpenManusAgent } from '../src/lib/agents/openmanus-agent';
import { ContentAgent } from '../src/lib/agents/content-agent';
import { AgentType, AgentCapability } from '../src/lib/agents/types';

async function testOpenManusIntegration() {
  console.log('🧪 Testing OpenManus Agent Integration...\n');

  try {
    // Test 1: Create OpenManus Agent
    console.log('1. Creating OpenManus Agent...');
    const openManusAgent = new OpenManusAgent();
    console.log(`✅ Agent Created: ${openManusAgent.name} (${openManusAgent.type})`);
    console.log(`   Capabilities: ${openManusAgent.capabilities.join(', ')}`);

    // Test 2: Test Bridge Connectivity
    console.log('\n2. Testing OpenManus Bridge Connectivity...');
    const bridgeTest = await openManusAgent.testBridge();
    console.log(`✅ Bridge Test: ${bridgeTest ? 'SUCCESS' : 'FAILED'}`);

    // Test 3: Execute Research Task
    console.log('\n3. Testing Research Task Execution...');
    const researchTask = {
      id: 'test-research-001',
      type: AgentCapability.RESEARCH,
      goal: 'Research AI agent development trends',
      input: {
        topic: 'AI agent development trends 2024',
        depth: 'comprehensive'
      }
    };

    const researchResult = await openManusAgent.run(researchTask);
    console.log(`✅ Research Task Status: ${researchResult.status}`);
    
    if (researchResult.status === 'success') {
      console.log('   Research Output Preview:');
      const outputText = typeof researchResult.output.result === 'string' 
        ? researchResult.output.result.substring(0, 200) + '...' 
        : JSON.stringify(researchResult.output.result).substring(0, 200) + '...';
      console.log(`   ${outputText}`);
    } else {
      console.log(`❌ Research Error: ${researchResult.error}`);
    }

    // Test 4: Test Content Agent (for comparison)
    console.log('\n4. Testing Content Agent (for comparison)...');
    const contentAgent = new ContentAgent();
    console.log(`✅ Content Agent Created: ${contentAgent.name} (${contentAgent.type})`);

    const contentTask = {
      id: 'test-content-001',
      type: AgentCapability.CONTENT,
      goal: 'Optimize content for better engagement',
      input: {
        text: 'This is a test content that needs optimization for better user engagement and search engine ranking.'
      }
    };

    const contentResult = await contentAgent.run(contentTask);
    console.log(`✅ Content Task Status: ${contentResult.status}`);
    
    if (contentResult.status === 'success') {
      console.log('   Content Optimization Complete');
      console.log(`   Original: ${contentResult.output.original.substring(0, 50)}...`);
      console.log(`   Optimized: ${contentResult.output.optimized.substring(0, 50)}...`);
    }

    // Test 5: Agent System Validation
    console.log('\n5. Agent System Validation...');
    const agentValidation = {
      openmanus: {
        type: openManusAgent.type,
        capabilities: openManusAgent.capabilities,
        works: researchResult.status === 'success'
      },
      content: {
        type: contentAgent.type,
        capabilities: contentAgent.capabilities,
        works: contentResult.status === 'success'
      }
    };

    console.log('📊 Agent System Status:');
    console.log(`   OpenManus Agent: ${agentValidation.openmanus.works ? '✅ OPERATIONAL' : '❌ FAILED'}`);
    console.log(`   Content Agent: ${agentValidation.content.works ? '✅ OPERATIONAL' : '❌ FAILED'}`);

    // Final Summary
    console.log('\n📋 Integration Test Summary:');
    console.log('='.repeat(50));
    
    const allTestsPassed = bridgeTest && 
                          researchResult.status === 'success' && 
                          contentResult.status === 'success';
    
    if (allTestsPassed) {
      console.log('✅ ALL TESTS PASSED');
      console.log('🎉 OpenManus Integration is FULLY OPERATIONAL');
      console.log('\n🚀 Ready for production deployment!');
    } else {
      console.log('❌ SOME TESTS FAILED');
      console.log('🔧 Integration needs attention before deployment');
    }

    console.log('\n💡 Next Steps:');
    console.log('   - Deploy to production environment');
    console.log('   - Configure OpenRouter API credentials in production');
    console.log('   - Set up monitoring and logging');
    console.log('   - Create agent orchestration workflows');

  } catch (error: any) {
    console.error('❌ Integration test failed with error:', error);
    process.exit(1);
  }
}

// Run the integration test
if (require.main === module) {
  testOpenManusIntegration().catch(console.error);
}

export { testOpenManusIntegration };