import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import Link from "next/link";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Users, Briefcase, Calendar, CheckSquare, AlertTriangle } from "lucide-react";

export const instant = false;

export default async function ProkerSummaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;
  const supabase = await createClient();

  // Ambil proker
  const { data: proker } = await supabase
    .from("prokers")
    .select("id, name, description, status, start_date, end_date")
    .eq("id", id)
    .single();

  // Ambil divisi
  const { data: divisions } = await supabase
    .from("divisions")
    .select("id, name, kind, sort_order")
    .eq("proker_id", id)
    .order("sort_order", { ascending: true });

  // Ambil tasks untuk menghitung progres nyata per divisi dan keseluruhan
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, division_id, status, deadline")
    .eq("proker_id", id);

  const todayStr = new Date().toISOString().split("T")[0];

  // Hitung progres keseluruhan
  const totalTasks = tasks?.length ?? 0;
  const completedTasks = tasks?.filter((t) => t.status === "selesai").length ?? 0;
  const overdueTasks =
    tasks?.filter((t) => t.status !== "selesai" && t.deadline && t.deadline < todayStr).length ?? 0;

  // Hitung progres per divisi
  const divProgressMap = new Map<
    string,
    { total: number; selesai: number; on_progress: number; belum: number; terlambat: number }
  >();

  for (const t of tasks ?? []) {
    const cur = divProgressMap.get(t.division_id) || {
      total: 0,
      selesai: 0,
      on_progress: 0,
      belum: 0,
      terlambat: 0,
    };
    cur.total++;
    if (t.status === "selesai") cur.selesai++;
    else if (t.status === "on_progress") cur.on_progress++;
    else if (t.status === "belum_dimulai") cur.belum++;

    if (t.status !== "selesai" && t.deadline && t.deadline < todayStr) {
      cur.terlambat++;
    }
    divProgressMap.set(t.division_id, cur);
  }

  // Ambil panitia inti (SC, PIC, Ketupel) dan koordinator divisi
  const { data: roles } = await supabase
    .from("proker_roles")
    .select("role, division_id, label, profiles(id, full_name, username)")
    .eq("proker_id", id);

  const scList = (roles ?? []).filter((r) => r.role === "sc");
  const picList = (roles ?? []).filter((r) => r.role === "pic");
  const ketupelList = (roles ?? []).filter((r) => r.role === "ketupel");

  const koorMap = new Map<string, string[]>();
  for (const r of roles ?? []) {
    if (r.role === "koor" && r.division_id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = r.profiles as any;
      if (p) {
        const arr = koorMap.get(r.division_id) || [];
        arr.push(p.full_name);
        koorMap.set(r.division_id, arr);
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Progres Keseluruhan Proker */}
      <section className="border border-line rounded-lg p-5 bg-bg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-2">
              Progres Keseluruhan Proker
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xl font-bold font-mono text-ink">
                {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
              </span>
              <span className="text-xs text-ink-2 font-mono">
                {completedTasks}/{totalTasks} task selesai
              </span>
            </div>
          </div>

          {overdueTasks > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-danger-soft border border-danger/20 text-danger text-xs font-semibold self-start sm:self-auto">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{overdueTasks} task terlambat</span>
            </div>
          )}
        </div>

        <ProgressBar value={completedTasks} total={totalTasks} />
      </section>

      {/* Deskripsi Proker */}
      {proker?.description && (
        <section className="border border-line rounded-lg p-5 bg-bg">
          <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-2 mb-2">
            Tentang Program Kerja
          </h2>
          <p className="text-sm text-ink leading-relaxed whitespace-pre-line">
            {proker.description}
          </p>
        </section>
      )}

      {/* Kepanitiaan Inti */}
      <section className="grid gap-3 sm:grid-cols-3">
        <div className="border border-line rounded-lg p-4 bg-bg">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-3">
            Steering Committee (SC)
          </span>
          <div className="mt-2 space-y-1">
            {scList.length === 0 ? (
              <p className="text-sm text-ink-2">—</p>
            ) : (
              scList.map((r, i) => (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                <p key={i} className="text-sm font-semibold text-ink">{(r.profiles as any)?.full_name}</p>
              ))
            )}
          </div>
        </div>

        <div className="border border-line rounded-lg p-4 bg-bg">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-3">
            Person In Charge (PIC)
          </span>
          <div className="mt-2 space-y-1">
            {picList.length === 0 ? (
              <p className="text-sm text-ink-2">—</p>
            ) : (
              picList.map((r, i) => (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                <p key={i} className="text-sm font-semibold text-ink">{(r.profiles as any)?.full_name}</p>
              ))
            )}
          </div>
        </div>

        <div className="border border-line rounded-lg p-4 bg-bg">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-3">
            Ketua Pelaksana
          </span>
          <div className="mt-2 space-y-1">
            {ketupelList.length === 0 ? (
              <p className="text-sm text-ink-2">—</p>
            ) : (
              ketupelList.map((r, i) => (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                <p key={i} className="text-sm font-semibold text-ink">{(r.profiles as any)?.full_name}</p>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Progres per Divisi (DESIGN.md Kartu Divisi) */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-2">
            Progres per Divisi ({divisions?.length ?? 0})
          </h2>
          <Link
            href={`/proker/${id}/task`}
            className="text-xs text-ink-2 hover:text-ink font-medium underline"
          >
            Lihat semua task →
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(divisions ?? []).map((div) => {
            const koors = koorMap.get(div.id) || [];
            const prog = divProgressMap.get(div.id) || {
              total: 0,
              selesai: 0,
              on_progress: 0,
              belum: 0,
              terlambat: 0,
            };

            return (
              <div key={div.id} className="border border-line rounded-lg p-4 bg-bg space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-ink">{div.name}</h3>
                  {prog.terlambat > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-danger-soft text-danger font-semibold">
                      {prog.terlambat} terlambat
                    </span>
                  )}
                </div>

                <div className="text-xs text-ink-2">
                  <span className="text-ink-3">Koor:</span>{" "}
                  {koors.length > 0 ? koors.join(", ") : "—"}
                </div>

                <div className="space-y-1">
                  <ProgressBar value={prog.selesai} total={prog.total} />
                  <div className="flex items-center justify-between text-[11px] text-ink-3 font-mono">
                    <span>
                      Belum {prog.belum} · Progress {prog.on_progress} · Selesai {prog.selesai}
                    </span>
                  </div>
                </div>

                <div className="pt-1">
                  <Link
                    href={`/proker/${id}/task`}
                    className="text-xs text-ink-2 hover:text-ink underline font-medium"
                  >
                    Buka task divisi →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Navigasi Cepat */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-line">
        <Link
          href={`/proker/${id}/tim`}
          className="border border-line rounded-lg p-3 hover:bg-surface transition-colors flex items-center gap-2.5 text-sm text-ink font-medium"
        >
          <Users className="h-4 w-4 text-ink-2" />
          Kepanitiaan Tim
        </Link>
        <Link
          href={`/proker/${id}/jobdesk`}
          className="border border-line rounded-lg p-3 hover:bg-surface transition-colors flex items-center gap-2.5 text-sm text-ink font-medium"
        >
          <Briefcase className="h-4 w-4 text-ink-2" />
          Daftar Jobdesk
        </Link>
        <Link
          href={`/proker/${id}/task`}
          className="border border-line rounded-lg p-3 hover:bg-surface transition-colors flex items-center gap-2.5 text-sm text-ink font-medium"
        >
          <CheckSquare className="h-4 w-4 text-ink-2" />
          Task & Tracking
        </Link>
        <Link
          href={`/proker/${id}/timeline`}
          className="border border-line rounded-lg p-3 hover:bg-surface transition-colors flex items-center gap-2.5 text-sm text-ink font-medium"
        >
          <Calendar className="h-4 w-4 text-ink-2" />
          Timeline Proker
        </Link>
      </section>
    </div>
  );
}
