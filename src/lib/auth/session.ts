import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type GlobalRole = "admin" | "bph" | "member" | "external";

export interface SessionUser {
  id: string;
  username: string;
  fullName: string;
  globalRole: GlobalRole;
  mustChangePassword: boolean;
  isActive: boolean;
}

/**
 * Get current authenticated user with profile data.
 * Returns null if not authenticated.
 */
export async function getSession(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, full_name, global_role, must_change_password, is_active")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.is_active) return null;

  return {
    id: user.id,
    username: profile.username,
    fullName: profile.full_name,
    globalRole: profile.global_role as GlobalRole,
    mustChangePassword: profile.must_change_password,
    isActive: profile.is_active,
  };
}

/**
 * Require authentication — redirect to login if not authenticated.
 */
export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/**
 * Require specific global role — redirect if not authorized.
 */
export async function requireRole(
  ...roles: GlobalRole[]
): Promise<SessionUser> {
  const session = await requireAuth();
  if (!roles.includes(session.globalRole)) {
    redirect("/");
  }
  return session;
}
