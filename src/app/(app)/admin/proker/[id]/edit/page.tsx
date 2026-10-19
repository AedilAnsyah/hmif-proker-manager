import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { EditProkerForm } from "./edit-proker-form";

export const metadata = { title: "Edit Proker" };

export default async function EditProkerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  await requireRole("admin", "bph");

  const { id } = await params;
  const supabase = await createClient();

  const { data: proker } = await supabase
    .from("prokers")
    .select("id, name, description, status, start_date, end_date, period_id")
    .eq("id", id)
    .single();

  if (!proker) {
    notFound();
  }

  const { data: periods } = await supabase
    .from("periods")
    .select("id, name, is_current")
    .order("is_current", { ascending: false })
    .order("name", { ascending: false });

  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name, global_role")
    .eq("is_active", true)
    .in("global_role", ["admin", "bph", "member"])
    .order("full_name");

  const { data: existingRoles } = await supabase
    .from("proker_roles")
    .select("user_id, role")
    .eq("proker_id", id);

  const picRole = existingRoles?.find((r) => r.role === "pic");
  const ketupelRole = existingRoles?.find((r) => r.role === "ketupel");
  const scRoles = existingRoles?.filter((r) => r.role === "sc").map((r) => r.user_id) ?? [];

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-ink mb-6">Edit Proker</h1>
      <EditProkerForm
        proker={proker}
        periods={periods ?? []}
        members={members ?? []}
        initialPicId={picRole?.user_id ?? ""}
        initialKetupelId={ketupelRole?.user_id ?? ""}
        initialScIds={scRoles}
      />
    </div>
  );
}
