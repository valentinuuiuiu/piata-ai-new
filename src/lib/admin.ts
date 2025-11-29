import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { query } from '@/lib/db';

/**
 * Check if a user is an administrator
 * Admin users: ionutbaltag3@gmail.com, claude.dev@mail.com, or users with 'admin' role in user_profiles
 */
export async function isUserAdmin(user: User): Promise<boolean> {
  // Check by email first (direct admin emails)
  const adminEmails = ['ionutbaltag3@gmail.com', 'claude.dev@mail.com'];
  if (adminEmails.includes(user.email || '')) {
    return true;
  }

  // Check by role in user_profiles table
  try {
    const userResult = await query('SELECT role FROM user_profiles WHERE user_id = ?', [user.id]);
    const userProfile = Array.isArray(userResult) ? userResult[0] : userResult;

    if (userProfile && (userProfile as any).role === 'admin') {
      return true;
    }
  } catch (error) {
    console.error('Error checking user role:', error);
  }

  return false;
}

/**
 * Require admin access for an API route
 * Returns the user if admin, throws error if not
 */
export async function requireAdmin(): Promise<User> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  const isAdmin = await isUserAdmin(user);
  if (!isAdmin) {
    throw new Error('Admin access required');
  }

  return user;
}