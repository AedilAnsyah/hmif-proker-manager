import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import Link from "next/link";

export const metadata = { title: "Semua Proker" };
export const instant = false;

export default async function SemuaProkerPage() {
  await connection();
  await requireRole("admin", "bph");

  const supabase = await createClient();
  const { data: prokers } = await supabase
    .from("prokers")
    .select("id, name, status, start_date, end_date, created_at, periods(name)")
    .order("created_at", { ascending: false });

  const statusLabels: Record<string, string> = {
    planning: "Perencanaan",
    active: "Aktif",
    done: "Selesai",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink lg:text-[26px]">Semua Proker</h1>
        <Link
          href="/admin/proker/baru"
          className="inline-flex items-center h-10 px-4 bg-accent text-on-accent font-semibold text-sm rounded-md hover:bg-accent-hover transition-colors"
        >
          Buat proker
        </Link>
      </div>

      {!prokers || prokers.length === 0 ? (
        <div className="border border-line rounded-lg p-8 text-center">
          <h3 className="text-base font-semibold text-ink">Belum ada proker</h3>
          <p className="mt-1 text-sm text-ink-2">Buat proker pertama untuk memulai.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {prokers.map((proker) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const period = proker.periods as any;
            return (
              <Link
                key={proker.id}
                href={`/proker/${proker.id}`}
                className="flex items-center justify-between border border-line rounded-lg p-4 hover:border-ink/20 transition-colors"
              >
                <div>
                  <h3 className="font-semibold text-ink">{proker.name}</h3>
                  <p className="text-xs text-ink-3 mt-0.5">{period?.name ?? "—"}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  proker.status === "active" ? "bg-accent text-on-accent" :
                  proker.status === "done" ? "bg-ink text-white" :
                  "border border-line-strong text-ink"
                }`}>
                  {statusLabels[proker.status]}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
