import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Use real client if env vars are present, otherwise fallback to mock
export const supabase = supabaseUrl && supabaseKey
  ? createClient<Database>(supabaseUrl, supabaseKey)
  : {
      from: (table: string) => ({
        select: (columns: string) => ({
          eq: (column: string, value: any) => ({
            single: () => Promise.resolve({ data: null, error: null }),
            order: (order: string) => Promise.resolve({ data: [], error: null }),
          }),
          order: (order: string) => Promise.resolve({ data: [], error: null }),
        }),
        insert: (data: any) => ({
          select: () => Promise.resolve({ data: data[0], error: null }),
        }),
        update: (data: any) => ({
          eq: (column: string, value: any) => ({
            select: () => Promise.resolve({ data, error: null }),
          }),
        }),
        delete: () => ({
          eq: (column: string, value: any) => Promise.resolve({ error: null }),
        }),
      }),
      auth: {
        getSession: () => Promise.resolve({ data: { session: null } }),
        onAuthStateChange: (callback: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: () => Promise.resolve({ error: null }),
        signUp: () => Promise.resolve({ data: { user: null }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
        resetPasswordForEmail: () => Promise.resolve({ error: null }),
      },
    } as any;