import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { PeriodManager } from "./period-manager";

export const metadata = { title: "Kelola Periode" };
export const instant = false;

export default async function AdminPeriodePage() {
  await connection();
  await requireRole("admin");

  const supabase = await createClient();
  const { data: periods } = await supabase
    .from("periods")
    .select("*")
    .order("is_current", { ascending: false })
    .order("name", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink lg:text-[26px] mb-6">Kelola Periode</h1>
      <PeriodManager periods={periods ?? []} />
    </div>
  );
}
