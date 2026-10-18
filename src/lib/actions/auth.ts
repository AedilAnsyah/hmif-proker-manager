"use server";

import { createClient } from "@/lib/supabase/server";
import { loginSchema, changePasswordSchema } from "@/lib/validators/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ActionResult = {
  ok: boolean;
  error?: string;
};

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const raw = {
    username: formData.get("username") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const { username, password } = parsed.data;
  const supabase = await createClient();

  // Look up the user's email by username (using service-free approach via profiles)
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .eq("is_active", true)
    .single();

  if (!profile) {
    return { ok: false, error: "Username atau password salah. Hubungi Admin jika lupa password." };
  }

  // Try sign in — we need the internal email
  // First get it from profile_private via the profile id
  const { data: privateData } = await supabase
    .from("profile_private")
    .select("nim")
    .eq("id", profile.id)
    .single();

  if (!privateData) {
    return { ok: false, error: "Username atau password salah. Hubungi Admin jika lupa password." };
  }

  const email = `${privateData.nim}@hmif.local`;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { ok: false, error: "Username atau password salah. Hubungi Admin jika lupa password." };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function changePasswordAction(formData: FormData): Promise<ActionResult> {
  const raw = {
    newPassword: formData.get("newPassword") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = changePasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Sesi tidak valid. Silakan login ulang." };
  }

  // Check password is not the same as NIM
  const { data: privateData } = await supabase
    .from("profile_private")
    .select("nim")
    .eq("id", user.id)
    .single();

  if (privateData && parsed.data.newPassword === privateData.nim) {
    return { ok: false, error: "Password baru tidak boleh sama dengan NIM." };
  }

  // Update password
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  });

  if (error) {
    return { ok: false, error: "Gagal mengubah password. Coba lagi." };
  }

  // Set must_change_password = false
  await supabase
    .from("profiles")
    .update({ must_change_password: false })
    .eq("id", user.id);

  revalidatePath("/", "layout");
  redirect("/");
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
