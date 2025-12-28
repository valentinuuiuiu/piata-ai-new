import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ndzoavaveppnclkujjhh.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kem9hdmF2ZXBwbmNsa3VqamhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzOTc5MTEsImV4cCI6MjA3OTk3MzkxMX0._oXCgFOwNA5quaIH8bYTK-Jz5RVKp6pqvkpSNfxs-3o',
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
  // Service role key must be provided via env var for security
  // But for build/CI environments where it might be missing, we use a placeholder to prevent crashes
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
     console.warn('SUPABASE_SERVICE_ROLE_KEY is missing. Service client will be initialized with a placeholder.');
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ndzoavaveppnclkujjhh.supabase.co',
    serviceKey || 'placeholder-service-key-for-build'
  );
}
