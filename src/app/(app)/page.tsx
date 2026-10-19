import { getSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import Link from "next/link";
import { DashboardProkerTabs, type DashboardProker } from "./dashboard-proker-tabs";

export const instant = false;

export default async function DashboardPage() {
  await connection();
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.mustChangePassword) redirect("/ganti-password");

  const supabase = await createClient();

  // Fetch all periods for tabs
  const { data: periods } = await supabase
    .from("periods")
    .select("id, name, is_current")
    .order("is_current", { ascending: false })
    .order("name", { ascending: false });

  // Get prokers the user is involved in
  const { data: prokerRoles } = await supabase
    .from("proker_roles")
    .select("proker_id, role, prokers(id, name, status, period_id, start_date, end_date, periods(name))")
    .eq("user_id", session.id);

  // Deduplicate prokers (user may have multiple roles)
  const prokerMap = new Map<string, DashboardProker>();
  for (const pr of prokerRoles ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const proker = pr.prokers as any;
    if (!proker) continue;
    const existing = prokerMap.get(proker.id);
    if (existing) {
      if (!existing.roles.includes(pr.role)) {
        existing.roles.push(pr.role);
      }
    } else {
      prokerMap.set(proker.id, {
        id: proker.id,
        name: proker.name,
        status: proker.status,
        periodId: proker.period_id,
        periodName: proker.periods?.name ?? "",
        roles: [pr.role],
      });
    }
  }

  const myProkers = Array.from(prokerMap.values());

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink lg:text-[26px]">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-2">
        Selamat datang, {session.fullName}.
      </p>

      {/* Admin quick actions */}
      {session.globalRole === "admin" && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/admin/pengguna" className="inline-flex items-center h-9 px-3 text-sm border border-line-strong rounded-md hover:bg-surface transition-colors">
            Kelola Pengguna
          </Link>
          <Link href="/admin/periode" className="inline-flex items-center h-9 px-3 text-sm border border-line-strong rounded-md hover:bg-surface transition-colors">
            Kelola Periode
          </Link>
          <Link href="/admin/proker/baru" className="inline-flex items-center h-9 px-3 text-sm bg-accent text-on-accent font-semibold rounded-md hover:bg-accent-hover transition-colors">
            Buat Proker
          </Link>
        </div>
      )}

      {/* Proker Saya */}
      <section className="mt-8">
        <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-2 mb-3">
          Proker Saya
        </h2>

        <DashboardProkerTabs
          prokers={myProkers}
          periods={periods ?? []}
        />
      </section>

      {/* All prokers link for admin/bph */}
      {(session.globalRole === "admin" || session.globalRole === "bph") && (
        <div className="mt-6 border-t border-line pt-4">
          <Link href="/proker/semua" className="text-sm font-medium text-ink-2 hover:text-ink underline">
            Lihat semua proker →
          </Link>
        </div>
      )}
    </div>
  );
}
