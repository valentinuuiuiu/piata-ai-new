import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Define a mock client type that satisfies the Supabase client interface minimally
// or just return any to bypass TS checks for now.
const createMockClient = () => {
  return new Proxy({}, {
    get: () => () => ({
      data: null,
      error: null,
      select: () => ({ data: null, error: null }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null }),
      eq: () => ({ data: null, error: null }),
      single: () => ({ data: null, error: null }),
      // Add more mock methods as needed
    })
  }) as any;
};

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  Supabase credentials missing. Using mock client.');
    return createMockClient();
  }

  const cookieStore = await cookies();

  try {
    return createServerClient(
      supabaseUrl,
      supabaseKey,
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
  } catch (error) {
    console.warn('Failed to create Supabase server client (using mock):', error);
    return createMockClient();
  }
}

export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Runtime check for missing keys
  if (!supabaseUrl || !serviceRoleKey) {
    if (process.env.NODE_ENV === 'production') {
       console.error('❌ Supabase configuration missing! NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
    } else {
       console.warn('⚠️  Supabase service credentials missing. Using mock client.');
    }
    // Return mock client to prevent crash
    return createMockClient();
  }

  try {
    return createSupabaseClient(supabaseUrl, serviceRoleKey);
  } catch (error) {
    console.warn('Failed to create Supabase service client (using mock):', error);
    return createMockClient();
  }
}
