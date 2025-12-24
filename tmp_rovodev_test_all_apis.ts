#!/usr/bin/env npx tsx
/**
 * Comprehensive API Testing Suite
 * Tests all endpoints including checkout, credits, automations
 */

const BASE_URL = 'http://localhost:3001';
const CRON_SECRET = process.env.CRON_SECRET || 'test-secret-1766568744';

interface TestResult {
  endpoint: string;
  method: string;
  status: number;
  success: boolean;
  responseTime: number;
  error?: string;
}

const results: TestResult[] = [];

async function testEndpoint(
  path: string, 
  method: string = 'GET', 
  body?: any, 
  headers: Record<string, string> = {}
): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined
    });

    const responseTime = Date.now() - startTime;
    const isSuccess = response.status < 400;

    return {
      endpoint: path,
      method,
      status: response.status,
      success: isSuccess,
      responseTime
    };
  } catch (error: any) {
    return {
      endpoint: path,
      method,
      status: 0,
      success: false,
      responseTime: Date.now() - startTime,
      error: error.message
    };
  }
}

async function runAPITests() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║        API ENDPOINTS - COMPREHENSIVE TEST          ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  console.log('🔍 Testing Public Endpoints...\n');

  // Public endpoints
  const publicTests = [
    { path: '/api/health', method: 'GET' },
    { path: '/api/categories', method: 'GET' },
    { path: '/api/anunturi?limit=5', method: 'GET' },
    { path: '/api/anunturi/search?q=test', method: 'GET' },
    { path: '/api/blog', method: 'GET' },
  ];

  for (const test of publicTests) {
    const result = await testEndpoint(test.path, test.method);
    results.push(result);
    
    const emoji = result.success ? '✅' : '❌';
    console.log(`${emoji} ${test.method} ${test.path}`);
    console.log(`   Status: ${result.status} | Time: ${result.responseTime}ms`);
    if (result.error) console.log(`   Error: ${result.error}`);
  }

  console.log('\n💳 Testing Stripe/Credits Endpoints...\n');

  // Stripe/Credits endpoints
  const stripeTests = [
    { 
      path: '/api/stripe', 
      method: 'POST',
      body: { credits: 10, userId: 'test-user', userEmail: 'test@test.com' }
    },
    {
      path: '/api/credits/stripe',
      method: 'POST',
      body: { amount: 25, credits: 5, userId: 'test-user' }
    }
  ];

  for (const test of stripeTests) {
    const result = await testEndpoint(test.path, test.method, test.body);
    results.push(result);
    
    const emoji = result.success ? '✅' : result.status === 500 ? '⚠️' : '❌';
    console.log(`${emoji} ${test.method} ${test.path}`);
    console.log(`   Status: ${result.status} | Time: ${result.responseTime}ms`);
    if (result.error) console.log(`   Error: ${result.error}`);
  }

  console.log('\n⚙️  Testing Cron/Automation Endpoints...\n');

  // Cron endpoints
  const cronTests = [
    { path: '/api/cron/blog-daily', method: 'POST', auth: true },
    { path: '/api/cron/shopping-agents-runner', method: 'POST', auth: true },
    { path: '/api/cron/social-media-generator', method: 'POST', auth: true },
    { path: '/api/cron/jules-orchestrator', method: 'POST', auth: true },
    { path: '/api/cron/autonomous-marketing', method: 'POST', auth: true }
  ];

  for (const test of cronTests) {
    const headers = test.auth ? { 'Authorization': `Bearer ${CRON_SECRET}` } : {};
    const result = await testEndpoint(test.path, test.method, undefined, headers);
    results.push(result);
    
    const emoji = result.success ? '✅' : result.status === 401 ? '🔒' : '❌';
    console.log(`${emoji} ${test.method} ${test.path}`);
    console.log(`   Status: ${result.status} | Time: ${result.responseTime}ms`);
    if (result.error) console.log(`   Error: ${result.error}`);
  }

  console.log('\n🤖 Testing AI/PAI Endpoints...\n');

  // AI endpoints
  const aiTests = [
    {
      path: '/api/pai',
      method: 'POST',
      body: { message: 'Test message', stream: false }
    }
  ];

  for (const test of aiTests) {
    const result = await testEndpoint(test.path, test.method, test.body);
    results.push(result);
    
    const emoji = result.success ? '✅' : '❌';
    console.log(`${emoji} ${test.method} ${test.path}`);
    console.log(`   Status: ${result.status} | Time: ${result.responseTime}ms`);
    if (result.error) console.log(`   Error: ${result.error}`);
  }

  // Summary
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║                  TEST SUMMARY                        ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  const totalTests = results.length;
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success && r.status !== 401).length;
  const authRequired = results.filter(r => r.status === 401).length;
  const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / totalTests;

  console.log(`Total Endpoints Tested: ${totalTests}`);
  console.log(`✅ Successful: ${successful} (${((successful/totalTests)*100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${failed} (${((failed/totalTests)*100).toFixed(1)}%)`);
  console.log(`🔒 Auth Required: ${authRequired}`);
  console.log(`⚡ Avg Response Time: ${avgResponseTime.toFixed(0)}ms`);

  // Failed endpoints
  if (failed > 0) {
    console.log('\n⚠️  Failed Endpoints:');
    results.filter(r => !r.success && r.status !== 401).forEach(r => {
      console.log(`   - ${r.method} ${r.endpoint}: Status ${r.status}`);
      if (r.error) console.log(`     Error: ${r.error}`);
    });
  }

  // Performance insights
  console.log('\n📊 Performance Breakdown:');
  const fastEndpoints = results.filter(r => r.responseTime < 1000).length;
  const slowEndpoints = results.filter(r => r.responseTime >= 1000 && r.responseTime < 3000).length;
  const verySlowEndpoints = results.filter(r => r.responseTime >= 3000).length;

  console.log(`   Fast (<1s): ${fastEndpoints}`);
  console.log(`   Slow (1-3s): ${slowEndpoints}`);
  console.log(`   Very Slow (>3s): ${verySlowEndpoints}`);

  if (verySlowEndpoints > 0) {
    console.log('\n   ⚠️  Very slow endpoints:');
    results.filter(r => r.responseTime >= 3000).forEach(r => {
      console.log(`      - ${r.endpoint}: ${r.responseTime}ms`);
    });
  }

  console.log('\n═══════════════════════════════════════════════════════\n');

  // Overall health
  const healthScore = (successful / totalTests) * 100;
  if (healthScore >= 80) {
    console.log('🎉 EXCELLENT! API health is great!\n');
  } else if (healthScore >= 60) {
    console.log('✅ GOOD! API is mostly healthy with minor issues.\n');
  } else if (healthScore >= 40) {
    console.log('⚠️  FAIR! Several endpoints need attention.\n');
  } else {
    console.log('❌ CRITICAL! Many endpoints are failing.\n');
  }
}

// Run tests
runAPITests().catch(console.error);
