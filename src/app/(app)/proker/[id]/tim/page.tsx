import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { TimManager } from "./tim-manager";

export const instant = false;
export const metadata = { title: "Tim & Divisi Proker" };

export default async function ProkerTimPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const session = await requireAuth();
  const { id } = await params;
  const supabase = await createClient();

  // Ambil divisi
  const { data: divisions } = await supabase
    .from("divisions")
    .select("id, name, kind, description, sort_order")
    .eq("proker_id", id)
    .order("sort_order", { ascending: true });

  // Ambil peran dalam proker ini beserta detail profil
  const { data: roles } = await supabase
    .from("proker_roles")
    .select("id, user_id, role, division_id, label, profiles(id, full_name, username, global_role, angkatan)")
    .eq("proker_id", id);

  const formattedRoles = (roles ?? []).map((r) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = r.profiles as any;
    return {
      id: r.id,
      user_id: r.user_id,
      role: r.role,
      division_id: r.division_id,
      label: r.label,
      full_name: p?.full_name ?? "—",
      username: p?.username ?? "—",
      global_role: p?.global_role ?? "member",
      angkatan: p?.angkatan ?? null,
    };
  });

  // Ambil daftar user aktif untuk dipilih saat tambah anggota
  const { data: users } = await supabase
    .from("profiles")
    .select("id, full_name, username, angkatan, global_role")
    .eq("is_active", true)
    .order("full_name", { ascending: true });

  const isManager =
    session.globalRole === "admin" ||
    formattedRoles.some(
      (r) => r.user_id === session.id && ["sc", "pic", "ketupel"].includes(r.role)
    );

  return (
    <div>
      <TimManager
        prokerId={id}
        divisions={divisions ?? []}
        memberRoles={formattedRoles}
        availableUsers={users ?? []}
        isManager={isManager}
      />
    </div>
  );
}
