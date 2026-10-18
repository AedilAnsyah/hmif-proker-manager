"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { createUserSchema, createPeriodSchema, createProkerSchema } from "@/lib/validators/auth";
import { normalizeUsername, generateInternalEmail } from "@/lib/auth/utils";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "./auth";

// ─── USER MANAGEMENT ────────────────────────────────────────

export async function createUserAction(formData: FormData): Promise<ActionResult> {
  const session = await getSession();
  if (!session || session.globalRole !== "admin") {
    return { ok: false, error: "Anda tidak memiliki akses untuk membuat akun." };
  }

  const raw = {
    fullName: formData.get("fullName") as string,
    nim: formData.get("nim") as string,
    angkatan: formData.get("angkatan") as string,
    globalRole: formData.get("globalRole") as string,
  };

  const parsed = createUserSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const { fullName, nim, angkatan, globalRole } = parsed.data;
  const username = normalizeUsername(fullName);
  const email = generateInternalEmail(nim);

  const adminClient = createAdminClient();

  // Check if username already exists
  const { data: existing } = await adminClient
    .from("profiles")
    .select("id")
    .eq("username", username)
    .single();

  if (existing) {
    return {
      ok: false,
      error: `Username "${username}" sudah dipakai. Tambahkan pembeda (mis. angkatan) di nama.`,
    };
  }

  // Check if NIM already exists
  const { data: existingNim } = await adminClient
    .from("profile_private")
    .select("id")
    .eq("nim", nim)
    .single();

  if (existingNim) {
    return { ok: false, error: "NIM sudah terdaftar." };
  }

  // Create auth user
  const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password: nim,
    email_confirm: true,
  });

  if (authError || !authUser.user) {
    return { ok: false, error: `Gagal membuat akun: ${authError?.message ?? "Unknown error"}` };
  }

  // Insert profile
  const { error: profileError } = await adminClient.from("profiles").insert({
    id: authUser.user.id,
    username,
    full_name: fullName.trim(),
    global_role: globalRole,
    angkatan,
    must_change_password: true,
    created_by: session.id,
  });

  if (profileError) {
    // Rollback: delete the auth user
    await adminClient.auth.admin.deleteUser(authUser.user.id);
    return { ok: false, error: `Gagal menyimpan profil: ${profileError.message}` };
  }

  // Insert private data (NIM)
  const { error: nimError } = await adminClient.from("profile_private").insert({
    id: authUser.user.id,
    nim,
  });

  if (nimError) {
    await adminClient.auth.admin.deleteUser(authUser.user.id);
    return { ok: false, error: `Gagal menyimpan NIM: ${nimError.message}` };
  }

  revalidatePath("/admin/pengguna");
  return { ok: true };
}

export async function toggleUserActiveAction(userId: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session || session.globalRole !== "admin") {
    return { ok: false, error: "Tidak berhak." };
  }

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("is_active")
    .eq("id", userId)
    .single();

  if (!profile) return { ok: false, error: "Pengguna tidak ditemukan." };

  const { error } = await adminClient
    .from("profiles")
    .update({ is_active: !profile.is_active })
    .eq("id", userId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/pengguna");
  return { ok: true };
}

export async function resetPasswordAction(userId: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session || session.globalRole !== "admin") {
    return { ok: false, error: "Tidak berhak." };
  }

  const adminClient = createAdminClient();

  // Get NIM for this user
  const { data: privateData } = await adminClient
    .from("profile_private")
    .select("nim")
    .eq("id", userId)
    .single();

  if (!privateData) return { ok: false, error: "Data pengguna tidak ditemukan." };

  // Reset password to NIM
  const { error: authError } = await adminClient.auth.admin.updateUserById(userId, {
    password: privateData.nim,
  });

  if (authError) return { ok: false, error: authError.message };

  // Set must_change_password
  await adminClient
    .from("profiles")
    .update({ must_change_password: true })
    .eq("id", userId);

  revalidatePath("/admin/pengguna");
  return { ok: true };
}

// ─── PERIOD MANAGEMENT ──────────────────────────────────────

export async function createPeriodAction(formData: FormData): Promise<ActionResult> {
  const session = await getSession();
  if (!session || session.globalRole !== "admin") {
    return { ok: false, error: "Tidak berhak." };
  }

  const parsed = createPeriodSchema.safeParse({
    name: formData.get("name"),
    startDate: formData.get("startDate") || undefined,
    endDate: formData.get("endDate") || undefined,
    isCurrent: formData.get("isCurrent") === "on",
  });

  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const supabase = await createClient();

  // If setting as current, unset others first
  if (parsed.data.isCurrent) {
    await supabase.from("periods").update({ is_current: false }).eq("is_current", true);
  }

  const { error } = await supabase.from("periods").insert({
    name: parsed.data.name,
    start_date: parsed.data.startDate || null,
    end_date: parsed.data.endDate || null,
    is_current: parsed.data.isCurrent,
  });

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Nama periode sudah ada." };
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/periode");
  return { ok: true };
}

export async function setCurrentPeriodAction(periodId: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session || session.globalRole !== "admin") {
    return { ok: false, error: "Tidak berhak." };
  }

  const supabase = await createClient();
  await supabase.from("periods").update({ is_current: false }).eq("is_current", true);
  const { error } = await supabase.from("periods").update({ is_current: true }).eq("id", periodId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/periode");
  return { ok: true };
}

// ─── PROKER MANAGEMENT ──────────────────────────────────────

export async function createProkerAction(formData: FormData): Promise<ActionResult> {
  const session = await getSession();
  if (!session || session.globalRole !== "admin") {
    return { ok: false, error: "Tidak berhak." };
  }

  const scIdsRaw = formData.get("scIds") as string;
  const parsed = createProkerSchema.safeParse({
    name: formData.get("name"),
    periodId: formData.get("periodId"),
    description: formData.get("description") || undefined,
    startDate: formData.get("startDate") || undefined,
    endDate: formData.get("endDate") || undefined,
    picId: formData.get("picId"),
    ketupelId: formData.get("ketupelId"),
    scIds: scIdsRaw ? JSON.parse(scIdsRaw) : [],
  });

  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const supabase = await createClient();

  // Create proker (trigger will auto-create Sekretaris & Bendahara divisions)
  const { data: proker, error } = await supabase
    .from("prokers")
    .insert({
      name: parsed.data.name,
      period_id: parsed.data.periodId,
      description: parsed.data.description || null,
      start_date: parsed.data.startDate || null,
      end_date: parsed.data.endDate || null,
      created_by: session.id,
    })
    .select("id")
    .single();

  if (error || !proker) return { ok: false, error: error?.message ?? "Gagal membuat proker." };

  // Assign PIC, Ketupel, SC roles
  const roles = [
    { proker_id: proker.id, user_id: parsed.data.picId, role: "pic" as const },
    { proker_id: proker.id, user_id: parsed.data.ketupelId, role: "ketupel" as const },
    ...parsed.data.scIds.map((scId) => ({
      proker_id: proker.id,
      user_id: scId,
      role: "sc" as const,
    })),
  ];

  const { error: rolesError } = await supabase.from("proker_roles").insert(roles);
  if (rolesError) {
    // Don't fail — proker created, roles can be assigned later
    console.error("Failed to assign roles:", rolesError.message);
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true };
}
