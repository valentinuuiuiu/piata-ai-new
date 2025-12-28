'use client'

import { createBrowserClient } from '@supabase/ssr'

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
    })
  }) as any;
};

export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn('Supabase credentials missing. Using mock client.');
    return createMockClient();
  }

  return createBrowserClient(url, key);
}
