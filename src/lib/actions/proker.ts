"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth/session";
import { normalizeUsername, generateInternalEmail } from "@/lib/auth/utils";
import {
  divisionSchema,
  memberRoleSchema,
  createNonHmifUserSchema,
  jobdeskSchema,
} from "@/lib/validators/proker";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "./auth";

/**
 * Helper internal untuk memeriksa apakah user saat ini adalah Manajer Proker (sc, pic, ketupel) atau Admin.
 */
async function assertProkerManager(prokerId: string) {
  const session = await getSession();
  if (!session) {
    throw new Error("Sesi tidak valid.");
  }
  if (session.globalRole === "admin") {
    return session;
  }
  const supabase = await createClient();
  const { data: role } = await supabase
    .from("proker_roles")
    .select("role")
    .eq("proker_id", prokerId)
    .eq("user_id", session.id)
    .in("role", ["sc", "pic", "ketupel"])
    .maybeSingle();

  if (!role) {
    throw new Error("Hanya Manajer Proker (Ketupel, PIC, SC) atau Admin yang berhak melakukan aksi ini.");
  }
  return session;
}

// ─────────────────────────────────────────────────────────────
// 1. MANAJEMEN DIVISI
// ─────────────────────────────────────────────────────────────

export async function createDivisionAction(formData: FormData): Promise<ActionResult> {
  try {
    const raw = {
      prokerId: formData.get("prokerId") as string,
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || undefined,
      sortOrder: formData.get("sortOrder") || 0,
    };
    const parsed = divisionSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

    await assertProkerManager(parsed.data.prokerId);

    const supabase = await createClient();
    const { error } = await supabase.from("divisions").insert({
      proker_id: parsed.data.prokerId,
      name: parsed.data.name.trim(),
      description: parsed.data.description || null,
      kind: "custom",
      sort_order: parsed.data.sortOrder,
    });

    if (error) return { ok: false, error: error.message };

    revalidatePath(`/proker/${parsed.data.prokerId}/tim`);
    revalidatePath(`/proker/${parsed.data.prokerId}/jobdesk`);
    revalidatePath(`/proker/${parsed.data.prokerId}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function updateDivisionAction(formData: FormData): Promise<ActionResult> {
  try {
    const raw = {
      id: formData.get("id") as string,
      prokerId: formData.get("prokerId") as string,
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || undefined,
      sortOrder: formData.get("sortOrder") || 0,
    };
    const parsed = divisionSchema.safeParse(raw);
    if (!parsed.success || !parsed.data.id) {
      return { ok: false, error: parsed.error?.issues[0].message || "ID divisi wajib ada" };
    }

    await assertProkerManager(parsed.data.prokerId);

    const supabase = await createClient();

    // Pastikan bukan divisi bawaan sekretaris atau bendahara
    const { data: div } = await supabase
      .from("divisions")
      .select("kind")
      .eq("id", parsed.data.id)
      .single();

    if (div && div.kind !== "custom") {
      return { ok: false, error: "Divisi bawaan Sekretaris & Bendahara tidak bisa diubah namanya." };
    }

    const { error } = await supabase
      .from("divisions")
      .update({
        name: parsed.data.name.trim(),
        description: parsed.data.description || null,
        sort_order: parsed.data.sortOrder,
      })
      .eq("id", parsed.data.id)
      .eq("proker_id", parsed.data.prokerId);

    if (error) return { ok: false, error: error.message };

    revalidatePath(`/proker/${parsed.data.prokerId}/tim`);
    revalidatePath(`/proker/${parsed.data.prokerId}/jobdesk`);
    revalidatePath(`/proker/${parsed.data.prokerId}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function deleteDivisionAction(divisionId: string, prokerId: string): Promise<ActionResult> {
  try {
    await assertProkerManager(prokerId);

    const supabase = await createClient();
    const { data: div } = await supabase
      .from("divisions")
      .select("kind")
      .eq("id", divisionId)
      .single();

    if (div && div.kind !== "custom") {
      return { ok: false, error: "Divisi bawaan Sekretaris & Bendahara tidak bisa dihapus." };
    }

    const { error } = await supabase
      .from("divisions")
      .delete()
      .eq("id", divisionId)
      .eq("proker_id", prokerId);

    if (error) return { ok: false, error: error.message };

    revalidatePath(`/proker/${prokerId}/tim`);
    revalidatePath(`/proker/${prokerId}/jobdesk`);
    revalidatePath(`/proker/${prokerId}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

// ─────────────────────────────────────────────────────────────
// 2. MANAJEMEN TIM & PERAN PANITIA
// ─────────────────────────────────────────────────────────────

export async function addMemberRoleAction(formData: FormData): Promise<ActionResult> {
  try {
    const raw = {
      prokerId: formData.get("prokerId") as string,
      userId: formData.get("userId") as string,
      role: formData.get("role") as string,
      divisionId: (formData.get("divisionId") as string) || undefined,
      label: (formData.get("label") as string) || undefined,
    };
    const parsed = memberRoleSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

    await assertProkerManager(parsed.data.prokerId);

    // Validasi aturan divisi: sc, pic, ketupel -> divisionId harus null; sekretaris, bendahara, koor, staff -> divisionId wajib
    if (["sc", "pic", "ketupel"].includes(parsed.data.role)) {
      parsed.data.divisionId = null;
    } else if (!parsed.data.divisionId) {
      return { ok: false, error: `Role ${parsed.data.role} wajib ditentukan divisinya.` };
    }

    const supabase = await createClient();
    const { error } = await supabase.from("proker_roles").insert({
      proker_id: parsed.data.prokerId,
      user_id: parsed.data.userId,
      role: parsed.data.role as "sc" | "pic" | "ketupel" | "sekretaris" | "bendahara" | "koor" | "staff",
      division_id: parsed.data.divisionId || null,
      label: parsed.data.label || null,
    });

    if (error) {
      if (error.code === "23505") {
        return { ok: false, error: "Anggota sudah memiliki role tersebut di divisi ini." };
      }
      return { ok: false, error: error.message };
    }

    revalidatePath(`/proker/${parsed.data.prokerId}/tim`);
    revalidatePath(`/proker/${parsed.data.prokerId}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function removeMemberRoleAction(roleId: string, prokerId: string): Promise<ActionResult> {
  try {
    await assertProkerManager(prokerId);
    const supabase = await createClient();

    // Validasi: pastikan jika yang dihapus adalah ketupel, minimal masih tersisa 1 ketupel lain
    const { data: targetRole } = await supabase
      .from("proker_roles")
      .select("role")
      .eq("id", roleId)
      .single();

    if (targetRole?.role === "ketupel") {
      const { count } = await supabase
        .from("proker_roles")
        .select("id", { count: "exact", head: true })
        .eq("proker_id", prokerId)
        .eq("role", "ketupel");

      if ((count ?? 0) <= 1) {
        return { ok: false, error: "Tidak dapat menghapus. Proker wajib memiliki minimal 1 Ketua Pelaksana." };
      }
    }

    const { error } = await supabase
      .from("proker_roles")
      .delete()
      .eq("id", roleId)
      .eq("proker_id", prokerId);

    if (error) return { ok: false, error: error.message };

    revalidatePath(`/proker/${prokerId}/tim`);
    revalidatePath(`/proker/${prokerId}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

// ─────────────────────────────────────────────────────────────
// 3. BUAT AKUN NON-HMIF DARI TIM & RESET PASSWORD NON-HMIF
// ─────────────────────────────────────────────────────────────

export async function createNonHmifMemberAction(formData: FormData): Promise<ActionResult> {
  try {
    const raw = {
      prokerId: formData.get("prokerId") as string,
      fullName: formData.get("fullName") as string,
      nim: formData.get("nim") as string,
      angkatan: formData.get("angkatan") as string,
      role: formData.get("role") as string,
      divisionId: (formData.get("divisionId") as string) || undefined,
      label: (formData.get("label") as string) || undefined,
    };
    const parsed = createNonHmifUserSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

    const session = await assertProkerManager(parsed.data.prokerId);

    const username = normalizeUsername(parsed.data.fullName);
    const email = generateInternalEmail(parsed.data.nim);

    const adminClient = createAdminClient();

    // Cek username
    const { data: existingUser } = await adminClient
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (existingUser) {
      return { ok: false, error: `Username "${username}" sudah dipakai. Tambahkan pembeda pada nama.` };
    }

    // Cek NIM
    const { data: existingNim } = await adminClient
      .from("profile_private")
      .select("id")
      .eq("nim", parsed.data.nim)
      .maybeSingle();

    if (existingNim) {
      return { ok: false, error: "NIM / nomor identitas sudah terdaftar." };
    }

    // Buat auth user dengan role non-HMIF ('external')
    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password: parsed.data.nim,
      email_confirm: true,
    });

    if (authError || !authUser.user) {
      return { ok: false, error: `Gagal membuat akun: ${authError?.message}` };
    }

    // Insert profil
    const { error: profileError } = await adminClient.from("profiles").insert({
      id: authUser.user.id,
      username,
      full_name: parsed.data.fullName.trim(),
      global_role: "external",
      angkatan: parsed.data.angkatan,
      must_change_password: true,
      created_by: session.id,
    });

    if (profileError) {
      await adminClient.auth.admin.deleteUser(authUser.user.id);
      return { ok: false, error: `Gagal menyimpan profil: ${profileError.message}` };
    }

    // Insert private data (NIM)
    const { error: nimError } = await adminClient.from("profile_private").insert({
      id: authUser.user.id,
      nim: parsed.data.nim,
    });

    if (nimError) {
      await adminClient.auth.admin.deleteUser(authUser.user.id);
      return { ok: false, error: `Gagal menyimpan NIM: ${nimError.message}` };
    }

    // Otomatis masukkan ke proker_roles
    let divisionId = parsed.data.divisionId || null;
    if (["sc", "pic", "ketupel"].includes(parsed.data.role)) {
      divisionId = null;
    }

    const { error: roleError } = await adminClient.from("proker_roles").insert({
      proker_id: parsed.data.prokerId,
      user_id: authUser.user.id,
      role: parsed.data.role as "sc" | "pic" | "ketupel" | "sekretaris" | "bendahara" | "koor" | "staff",
      division_id: divisionId,
      label: parsed.data.label || null,
    });

    if (roleError) {
      console.error("Gagal menambahkan role:", roleError.message);
    }

    revalidatePath(`/proker/${parsed.data.prokerId}/tim`);
    revalidatePath(`/proker/${parsed.data.prokerId}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function resetNonHmifPasswordAction(targetUserId: string, prokerId: string): Promise<ActionResult> {
  try {
    await assertProkerManager(prokerId);

    const adminClient = createAdminClient();

    // Verifikasi bahwa user target adalah pengguna non-HMIF (global_role = 'external')
    // dan tergabung di proker ini
    const { data: profile } = await adminClient
      .from("profiles")
      .select("global_role")
      .eq("id", targetUserId)
      .single();

    if (!profile || profile.global_role !== "external") {
      return { ok: false, error: "Hanya akun panitia non-HMIF yang dapat direset oleh Manajer Proker." };
    }

    const { data: userRole } = await adminClient
      .from("proker_roles")
      .select("id")
      .eq("proker_id", prokerId)
      .eq("user_id", targetUserId)
      .maybeSingle();

    if (!userRole) {
      return { ok: false, error: "Pengguna tidak tergabung dalam proker ini." };
    }

    const { data: priv } = await adminClient
      .from("profile_private")
      .select("nim")
      .eq("id", targetUserId)
      .single();

    if (!priv) return { ok: false, error: "Identitas pengguna tidak ditemukan." };

    // Reset password ke NIM
    const { error: authError } = await adminClient.auth.admin.updateUserById(targetUserId, {
      password: priv.nim,
    });

    if (authError) return { ok: false, error: authError.message };

    await adminClient
      .from("profiles")
      .update({ must_change_password: true })
      .eq("id", targetUserId);

    revalidatePath(`/proker/${prokerId}/tim`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

// ─────────────────────────────────────────────────────────────
// 4. MANAJEMEN JOBDESK
// ─────────────────────────────────────────────────────────────

export async function createJobdeskAction(formData: FormData): Promise<ActionResult> {
  try {
    const raw = {
      divisionId: formData.get("divisionId") as string,
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      sortOrder: formData.get("sortOrder") || 0,
    };
    const parsed = jobdeskSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

    const supabase = await createClient();
    const { data: div } = await supabase
      .from("divisions")
      .select("proker_id")
      .eq("id", parsed.data.divisionId)
      .single();

    if (!div) return { ok: false, error: "Divisi tidak ditemukan." };
    const session = await assertProkerManager(div.proker_id);

    const { error } = await supabase.from("jobdesks").insert({
      division_id: parsed.data.divisionId,
      title: parsed.data.title.trim(),
      description: parsed.data.description || null,
      sort_order: parsed.data.sortOrder,
      created_by: session.id,
    });

    if (error) return { ok: false, error: error.message };

    revalidatePath(`/proker/${div.proker_id}/jobdesk`);
    revalidatePath(`/proker/${div.proker_id}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function updateJobdeskAction(formData: FormData): Promise<ActionResult> {
  try {
    const raw = {
      id: formData.get("id") as string,
      divisionId: formData.get("divisionId") as string,
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      sortOrder: formData.get("sortOrder") || 0,
    };
    const parsed = jobdeskSchema.safeParse(raw);
    if (!parsed.success || !parsed.data.id) {
      return { ok: false, error: parsed.error?.issues[0].message || "ID Jobdesk wajib ada" };
    }

    const supabase = await createClient();
    const { data: div } = await supabase
      .from("divisions")
      .select("proker_id")
      .eq("id", parsed.data.divisionId)
      .single();

    if (!div) return { ok: false, error: "Divisi tidak ditemukan." };
    await assertProkerManager(div.proker_id);

    const { error } = await supabase
      .from("jobdesks")
      .update({
        title: parsed.data.title.trim(),
        description: parsed.data.description || null,
        sort_order: parsed.data.sortOrder,
      })
      .eq("id", parsed.data.id)
      .eq("division_id", parsed.data.divisionId);

    if (error) return { ok: false, error: error.message };

    revalidatePath(`/proker/${div.proker_id}/jobdesk`);
    revalidatePath(`/proker/${div.proker_id}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function deleteJobdeskAction(jobdeskId: string, divisionId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: div } = await supabase
      .from("divisions")
      .select("proker_id")
      .eq("id", divisionId)
      .single();

    if (!div) return { ok: false, error: "Divisi tidak ditemukan." };
    await assertProkerManager(div.proker_id);

    const { error } = await supabase
      .from("jobdesks")
      .delete()
      .eq("id", jobdeskId)
      .eq("division_id", divisionId);

    if (error) return { ok: false, error: error.message };

    revalidatePath(`/proker/${div.proker_id}/jobdesk`);
    revalidatePath(`/proker/${div.proker_id}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
