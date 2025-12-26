/**
 * Next.js Instrumentation Hook
 * Automatically initializes OpenTelemetry tracing when the server starts.
 * 
 * This file is executed by Next.js at server startup, before any routes are loaded.
 * It ensures tracing is active for all API routes and operations.
 * 
 * Reference: https://nextjs.org/docs/app/building-your-application/optimizing/open-telemetry
 */

export async function register() {
  // Only initialize on server-side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Import tracing initialization
    const { initializeTracing } = await import('@/lib/tracing');
    
    // Initialize OpenTelemetry
    initializeTracing();
    
    console.log('📡 Tracing instrumentation loaded');
  }
}
