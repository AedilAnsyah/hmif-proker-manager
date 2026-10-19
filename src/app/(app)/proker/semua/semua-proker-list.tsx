"use client";

import { useState } from "react";
import Link from "next/link";
import { Settings } from "lucide-react";

interface ProkerItem {
  id: string;
  name: string;
  status: "planning" | "active" | "done";
  periodId: string;
  periodName: string;
}

interface PeriodItem {
  id: string;
  name: string;
  is_current: boolean;
}

export function SemuaProkerList({
  prokers,
  periods,
  canManage,
}: {
  prokers: ProkerItem[];
  periods: PeriodItem[];
  canManage: boolean;
}) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const statusLabels: Record<string, string> = {
    planning: "Perencanaan",
    active: "Aktif",
    done: "Selesai",
  };

  const filtered = prokers.filter((p) => {
    const matchPeriod = !selectedPeriod || p.periodId === selectedPeriod;
    const matchStatus = !selectedStatus || p.status === selectedStatus;
    return matchPeriod && matchStatus;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="h-10 rounded-md border border-line bg-bg px-3 text-sm text-ink"
        >
          <option value="">Semua periode</option>
          {periods.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} {p.is_current ? "(Aktif)" : ""}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="h-10 rounded-md border border-line bg-bg px-3 text-sm text-ink"
        >
          <option value="">Semua status</option>
          <option value="planning">Perencanaan</option>
          <option value="active">Aktif</option>
          <option value="done">Selesai</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="border border-line rounded-lg p-8 text-center">
          <h3 className="text-base font-semibold text-ink">Tidak ada proker</h3>
          <p className="mt-1 text-sm text-ink-2">Tidak ada proker yang cocok dengan filter yang dipilih.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((proker) => (
            <div
              key={proker.id}
              className="flex items-center justify-between border border-line rounded-lg p-4 hover:border-ink/20 transition-colors bg-bg"
            >
              <Link href={`/proker/${proker.id}`} className="flex-1">
                <div>
                  <h3 className="font-semibold text-ink hover:underline">{proker.name}</h3>
                  <p className="text-xs text-ink-3 mt-0.5">{proker.periodName || "—"}</p>
                </div>
              </Link>

              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    proker.status === "active"
                      ? "bg-accent text-on-accent"
                      : proker.status === "done"
                      ? "bg-ink text-white"
                      : "border border-line-strong text-ink"
                  }`}
                >
                  {statusLabels[proker.status]}
                </span>

                {canManage && (
                  <Link
                    href={`/admin/proker/${proker.id}/edit`}
                    className="p-1.5 text-ink-2 hover:text-ink rounded hover:bg-surface transition-colors"
                    title="Edit proker"
                  >
                    <Settings className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
