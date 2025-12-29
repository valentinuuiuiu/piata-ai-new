import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function createClient() {
  const cookieStore = await cookies();

  // Fallback for build time or missing env vars
  // IMPORTANT: @supabase/ssr throws if URL/Key are empty strings.
  // We use placeholders if the env vars are completely missing or empty.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Fallback for older cookieStore versions
          }
        },
      },
    }
  );
}

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
