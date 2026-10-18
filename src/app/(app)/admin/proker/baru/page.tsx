import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { CreateProkerForm } from "./create-proker-form";

export const metadata = { title: "Buat Proker Baru" };
export const instant = false;

export default async function BuatProkerPage() {
  await connection();
  await requireRole("admin");

  const supabase = await createClient();

  const { data: periods } = await supabase
    .from("periods")
    .select("id, name, is_current")
    .order("is_current", { ascending: false })
    .order("name", { ascending: false });

  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name, global_role")
    .eq("is_active", true)
    .in("global_role", ["admin", "member"])
    .order("full_name");

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-ink mb-6">Buat Proker Baru</h1>
      <CreateProkerForm
        periods={periods ?? []}
        members={members ?? []}
      />
    </div>
  );
}
