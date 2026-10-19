import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import Link from "next/link";
import { Users, Briefcase, Calendar, CheckSquare } from "lucide-react";

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
      {/* Deskripsi Proker */}
      <section className="border border-line rounded-lg p-5 bg-bg">
        <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-2 mb-2">
          Tentang Program Kerja
        </h2>
        <p className="text-sm text-ink leading-relaxed">
          {proker?.description || "Belum ada deskripsi untuk program kerja ini."}
        </p>
      </section>

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

      {/* Struktur Divisi */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-2">
            Struktur Divisi ({divisions?.length ?? 0})
          </h2>
          <Link
            href={`/proker/${id}/tim`}
            className="text-xs text-ink-2 hover:text-ink font-medium underline"
          >
            Kelola Tim & Divisi →
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(divisions ?? []).map((div) => {
            const koors = koorMap.get(div.id) || [];
            return (
              <div key={div.id} className="border border-line rounded-lg p-4 bg-bg">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-ink">{div.name}</h3>
                  {div.kind !== "custom" && (
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-surface border border-line text-ink-3">
                      Bawaan
                    </span>
                  )}
                </div>
                <div className="mt-2 text-xs text-ink-2">
                  <span className="text-ink-3 font-mono">Koordinator:</span>{" "}
                  {koors.length > 0 ? koors.join(", ") : "Belum ditentukan"}
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
