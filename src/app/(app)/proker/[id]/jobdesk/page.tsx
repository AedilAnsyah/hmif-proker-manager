import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { JobdeskManager } from "./jobdesk-manager";

export const instant = false;
export const metadata = { title: "Jobdesk Panitia" };

export default async function ProkerJobdeskPage({
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
    .select("id, name, kind, sort_order")
    .eq("proker_id", id)
    .order("sort_order", { ascending: true });

  const divisionIds = (divisions ?? []).map((d) => d.id);

  // Ambil jobdesk dari semua divisi di proker ini
  const { data: jobdesks } = await supabase
    .from("jobdesks")
    .select("id, division_id, title, description, sort_order")
    .in("division_id", divisionIds.length > 0 ? divisionIds : ["00000000-0000-0000-0000-000000000000"])
    .order("sort_order", { ascending: true });

  // Cek apakah user adalah Manajer proker
  const { data: roles } = await supabase
    .from("proker_roles")
    .select("role")
    .eq("proker_id", id)
    .eq("user_id", session.id);

  const isManager =
    session.globalRole === "admin" ||
    (roles ?? []).some((r) => ["sc", "pic", "ketupel"].includes(r.role));

  return (
    <div>
      <JobdeskManager
        divisions={divisions ?? []}
        jobdesks={jobdesks ?? []}
        isManager={isManager}
      />
    </div>
  );
}
