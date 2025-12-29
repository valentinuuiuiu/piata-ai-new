import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
export { createServiceClient } from './service-client';

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
