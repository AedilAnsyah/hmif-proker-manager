import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import Link from "next/link";
import { SemuaProkerList } from "./semua-proker-list";

export const metadata = { title: "Semua Proker" };
export const instant = false;

export default async function SemuaProkerPage() {
  await connection();
  const session = await requireRole("admin", "bph");

  const supabase = await createClient();
  const { data: prokers } = await supabase
    .from("prokers")
    .select("id, name, status, period_id, start_date, end_date, created_at, periods(id, name)")
    .order("created_at", { ascending: false });

  const { data: periods } = await supabase
    .from("periods")
    .select("id, name, is_current")
    .order("is_current", { ascending: false })
    .order("name", { ascending: false });

  const formattedProkers = (prokers ?? []).map((p) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const period = p.periods as any;
    return {
      id: p.id,
      name: p.name,
      status: p.status,
      periodId: p.period_id,
      periodName: period?.name ?? "",
    };
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink lg:text-[26px]">Semua Proker</h1>
        {session.globalRole === "admin" && (
          <Link
            href="/admin/proker/baru"
            className="inline-flex items-center h-10 px-4 bg-accent text-on-accent font-semibold text-sm rounded-md hover:bg-accent-hover transition-colors"
          >
            Buat proker
          </Link>
        )}
      </div>

      <SemuaProkerList
        prokers={formattedProkers}
        periods={periods ?? []}
        canManage={session.globalRole === "admin"}
      />
    </div>
  );
}
