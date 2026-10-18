import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Supabase admin client with SERVICE_ROLE_KEY.
 * 
 * ⚠️ WARNING: This bypasses RLS. Only use in server actions that
 * have ALREADY verified the caller's permissions.
 * 
 * Use cases:
 * - Creating user accounts (auth.admin.createUser)
 * - Resetting passwords (auth.admin.updateUserById)
 * - Reading profile_private (NIM)
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL. " +
      "These must be set in environment variables (server-side only)."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
