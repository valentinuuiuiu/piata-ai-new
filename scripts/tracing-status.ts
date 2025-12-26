/**
 * Tracing Health Check and Status Monitor
 * 
 * Use this to verify tracing is working properly in your workspace.
 * Run: npm run tracing:status
 */

import http from 'http';

const OTLP_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces';
const SERVICE_NAME = process.env.OTEL_SERVICE_NAME || 'piata-ai-backend';

interface TracingStatus {
  enabled: boolean;
  endpoint: string;
  serviceName: string;
  collectorHealth: 'healthy' | 'unreachable' | 'unknown';
  timestamp: string;
  environment: string;
}

async function checkCollectorHealth(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const url = new URL(OTLP_ENDPOINT);
      const healthCheckUrl = `http://${url.hostname}:${url.port}/health`;
      
      const request = http.get(healthCheckUrl, { timeout: 2000 }, (res) => {
        resolve(res.statusCode === 200);
      });

      request.on('error', () => resolve(false));
      request.on('timeout', () => {
        request.destroy();
        resolve(false);
      });
    } catch {
      resolve(false);
    }
  });
}

async function getTracingStatus(): Promise<TracingStatus> {
  const collectorHealth = await checkCollectorHealth();

  return {
    enabled: true,
    endpoint: OTLP_ENDPOINT,
    serviceName: SERVICE_NAME,
    collectorHealth: collectorHealth ? 'healthy' : 'unreachable',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  };
}

function printStatus(status: TracingStatus): void {
  console.clear();
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║           🔍 PIATA AI TRACING STATUS MONITOR                    ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log('📊 Current Status:');
  console.log(`  • Tracing Enabled: ${status.enabled ? '✅ YES' : '❌ NO'}`);
  console.log(`  • Service Name: ${status.serviceName}`);
  console.log(`  • Environment: ${status.environment}`);
  console.log(`  • Timestamp: ${status.timestamp}\n`);

  console.log('📡 OTLP Collector:');
  console.log(`  • Endpoint: ${status.endpoint}`);
  console.log(`  • Health: ${
    status.collectorHealth === 'healthy'
      ? '✅ HEALTHY'
      : status.collectorHealth === 'unreachable'
      ? '❌ UNREACHABLE'
      : '❓ UNKNOWN'
  }`);

  if (status.collectorHealth === 'unreachable') {
    console.log('\n⚠️  Collector Not Running!');
    console.log('   Fix: Open VSCode Command Palette (Ctrl+Shift+P)');
    console.log('        Run: ai-mlstudio.tracing.open');
  } else if (status.collectorHealth === 'healthy') {
    console.log('\n✅ Ready to trace! Start your app with:');
    console.log('   npm run dev:with-tracing');
  }

  console.log('\n📁 Tracing Files:');
  console.log('  • /src/lib/tracing.ts - Core tracing setup');
  console.log('  • /src/lib/api-with-tracing.ts - API route helpers');
  console.log('  • /src/instrumentation.ts - Next.js hook');
  console.log('  • /scripts/start-with-tracing.ts - Startup script');
  console.log('  • /TRACING_GUIDE.md - Full documentation');
  console.log('  • /TRACING_QUICK_START.md - Quick reference\n');

  console.log('💡 Next Steps:');
  if (status.collectorHealth === 'healthy') {
    console.log('  1. Run: npm run dev:with-tracing');
    console.log('  2. Make API requests to your endpoints');
    console.log('  3. Watch traces appear in VSCode trace viewer\n');
  } else {
    console.log('  1. Open VSCode');
    console.log('  2. Run: ai-mlstudio.tracing.open');
    console.log('  3. Come back here and re-run this check\n');
  }

  console.log('📚 Resources:');
  console.log('  • https://opentelemetry.io/docs/');
  console.log('  • https://code.visualstudio.com/docs/ai/ai-toolkit\n');
}

// Main execution
(async () => {
  const status = await getTracingStatus();
  printStatus(status);
})();
