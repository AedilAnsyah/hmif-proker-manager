"use client";

import { useState } from "react";
import Link from "next/link";
import { ProgressBar } from "@/components/ui/progress-bar";

export interface DashboardProker {
  id: string;
  name: string;
  status: "planning" | "active" | "done";
  periodId: string;
  periodName: string;
  roles: string[];
  taskCompleted: number;
  taskTotal: number;
}

export interface PeriodItem {
  id: string;
  name: string;
  is_current: boolean;
}

const roleLabels: Record<string, string> = {
  sc: "SC",
  pic: "PIC",
  ketupel: "Ketua Pelaksana",
  sekretaris: "Sekretaris",
  bendahara: "Bendahara",
  koor: "Koordinator",
  staff: "Staff",
};

export function DashboardProkerTabs({
  prokers,
  periods,
}: {
  prokers: DashboardProker[];
  periods: PeriodItem[];
}) {
  const currentPeriod = periods.find((p) => p.is_current);
  // Default tab: active period id, or 'all', or 'history'
  const [activeTab, setActiveTab] = useState<string>(currentPeriod?.id ?? (periods[0]?.id || "all"));

  const filtered = prokers.filter((p) => {
    if (activeTab === "history") {
      return p.status === "done";
    }
    if (activeTab === "all") {
      return true;
    }
    return p.periodId === activeTab;
  });

  return (
    <div>
      {/* Tab Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-line mb-4">
        {periods.map((p) => (
          <button
            key={p.id}
            onClick={() => setActiveTab(p.id)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === p.id
                ? "bg-ink text-white"
                : "text-ink-2 hover:text-ink hover:bg-surface"
            }`}
          >
            {p.name} {p.is_current ? "(Aktif)" : ""}
          </button>
        ))}
        <button
          onClick={() => setActiveTab("history")}
          className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
            activeTab === "history"
              ? "bg-ink text-white"
              : "text-ink-2 hover:text-ink hover:bg-surface"
          }`}
        >
          Riwayat
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="border border-line rounded-lg p-8 text-center">
          <h3 className="text-base font-semibold text-ink">Belum ada proker</h3>
          <p className="mt-1 text-sm text-ink-2">
            Anda belum terdaftar di proker untuk periode ini.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {filtered.map((proker) => (
            <Link
              key={proker.id}
              href={`/proker/${proker.id}`}
              className="block border border-line rounded-lg p-4 hover:border-ink/20 transition-colors bg-bg"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-base font-semibold text-ink">{proker.name}</h3>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ml-2 ${
                    proker.status === "active"
                      ? "bg-accent text-on-accent"
                      : proker.status === "done"
                      ? "bg-ink text-white"
                      : "border border-line-strong text-ink"
                  }`}
                >
                  {proker.status === "active" ? "Aktif" : proker.status === "done" ? "Selesai" : "Perencanaan"}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {proker.roles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-surface border border-line text-ink-2"
                  >
                    {roleLabels[role] ?? role}
                  </span>
                ))}
              </div>
              <div className="mt-3">
                <ProgressBar value={proker.taskCompleted} total={proker.taskTotal} />
              </div>
              <p className="text-xs text-ink-3 font-mono mt-2">{proker.periodName}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
