import { getSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import Link from "next/link";
import { ProgressBar } from "@/components/ui/progress-bar";

export const instant = false;

export default async function DashboardPage() {
  await connection();
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.mustChangePassword) redirect("/ganti-password");

  const supabase = await createClient();

  // Get prokers the user is involved in
  const { data: prokerRoles } = await supabase
    .from("proker_roles")
    .select("proker_id, role, prokers(id, name, status, start_date, end_date, periods(name))")
    .eq("user_id", session.id);

  // Deduplicate prokers (user may have multiple roles)
  const prokerMap = new Map<string, { id: string; name: string; status: string; roles: string[]; periodName: string }>();
  for (const pr of prokerRoles ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const proker = pr.prokers as any;
    if (!proker) continue;
    const existing = prokerMap.get(proker.id);
    if (existing) {
      existing.roles.push(pr.role);
    } else {
      prokerMap.set(proker.id, {
        id: proker.id,
        name: proker.name,
        status: proker.status,
        roles: [pr.role],
        periodName: proker.periods?.name ?? "",
      });
    }
  }

  const myProkers = Array.from(prokerMap.values());

  const roleLabels: Record<string, string> = {
    sc: "SC",
    pic: "PIC",
    ketupel: "Ketua Pelaksana",
    sekretaris: "Sekretaris",
    bendahara: "Bendahara",
    koor: "Koordinator",
    staff: "Staff",
  };

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

        {myProkers.length === 0 ? (
          <div className="border border-line rounded-lg p-8 text-center">
            <h3 className="text-base font-semibold text-ink">Belum ada proker</h3>
            <p className="mt-1 text-sm text-ink-2">
              Anda belum terdaftar di proker mana pun.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {myProkers.map((proker) => (
              <Link
                key={proker.id}
                href={`/proker/${proker.id}`}
                className="block border border-line rounded-lg p-4 hover:border-ink/20 transition-colors"
              >
                <h3 className="text-base font-semibold text-ink">{proker.name}</h3>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {proker.roles.map((role) => (
                    <span key={role} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-surface border border-line text-ink-2">
                      {roleLabels[role] ?? role}
                    </span>
                  ))}
                </div>
                <div className="mt-3">
                  <ProgressBar value={0} total={0} />
                </div>
                <p className="text-xs text-ink-3 font-mono mt-2">{proker.periodName}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* All prokers link for admin/bph */}
      {(session.globalRole === "admin" || session.globalRole === "bph") && (
        <div className="mt-4">
          <Link href="/proker/semua" className="text-sm text-ink-2 hover:text-ink underline">
            Lihat semua proker →
          </Link>
        </div>
      )}
    </div>
  );
}
