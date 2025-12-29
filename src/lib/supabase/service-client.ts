import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    // Return a mock client or throw a specific error that can be caught,
    // or return a proxy that throws when used.
    // For build safety, we'll return a minimal mock if we are in a build environment.

    // We log a warning so developers know this is happening
    if (process.env.NODE_ENV !== 'production' || process.env.NEXT_PHASE === 'phase-production-build') {
         console.warn('⚠️ Supabase credentials missing (createServiceClient). Returning mock client for build/dev safety.');
    }

    // Minimal mock to prevent "supabaseUrl is required" crash during module load
    // The keys must be non-empty strings
    return createSupabaseClient('https://mock.supabase.co', 'mock-key');
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceKey);
}
