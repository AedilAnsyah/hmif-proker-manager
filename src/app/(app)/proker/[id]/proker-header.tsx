"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Settings } from "lucide-react";
import { formatDate } from "@/lib/format";

interface ProkerHeaderProps {
  prokerId: string;
  name: string;
  status: "planning" | "active" | "done";
  periodName: string;
  startDate: string | null;
  endDate: string | null;
  isManager: boolean;
  myRoles: string[];
}

export function ProkerHeader({
  prokerId,
  name,
  status,
  periodName,
  startDate,
  endDate,
  isManager,
}: ProkerHeaderProps) {
  const pathname = usePathname();

  const tabs = [
    { label: "Ringkasan", href: `/proker/${prokerId}` },
    { label: "Tim", href: `/proker/${prokerId}/tim` },
    { label: "Jobdesk", href: `/proker/${prokerId}/jobdesk` },
    { label: "Task", href: `/proker/${prokerId}/task` },
    { label: "Timeline", href: `/proker/${prokerId}/timeline` },
    { label: "Rapat", href: `/proker/${prokerId}/rapat` },
    { label: "Keuangan", href: `/proker/${prokerId}/keuangan` },
    { label: "Dokumen", href: `/proker/${prokerId}/dokumen` },
  ];

  const statusLabels = {
    planning: "Perencanaan",
    active: "Aktif",
    done: "Selesai",
  };

  return (
    <div className="border-b border-line pb-0">
      {/* Back button & Admin/Manager Edit link */}
      <div className="flex items-center justify-between mb-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-ink-2 hover:text-ink font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Dashboard
        </Link>

        {isManager && (
          <Link
            href={`/admin/proker/${prokerId}/edit`}
            className="inline-flex items-center gap-1 text-xs text-ink-2 hover:text-ink font-medium py-1 px-2 rounded hover:bg-surface transition-colors"
          >
            <Settings className="h-3.5 w-3.5" />
            Pengaturan Proker
          </Link>
        )}
      </div>

      {/* Title & Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-ink lg:text-[28px]">{name}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-ink-3">
            <span className="font-mono">{periodName}</span>
            {(startDate || endDate) && (
              <>
                <span>•</span>
                <span>
                  {startDate ? formatDate(startDate) : "?"} — {endDate ? formatDate(endDate) : "?"}
                </span>
              </>
            )}
          </div>
        </div>

        <div>
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
              status === "active"
                ? "bg-accent text-on-accent"
                : status === "done"
                ? "bg-ink text-white"
                : "border border-line-strong text-ink"
            }`}
          >
            {statusLabels[status]}
          </span>
        </div>
      </div>

      {/* Tabs list (Horizontal scroll on mobile) */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar -mb-px">
        {tabs.map((tab) => {
          const isActive =
            tab.href === `/proker/${prokerId}`
              ? pathname === tab.href
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-3.5 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? "border-accent text-ink font-semibold"
                  : "border-transparent text-ink-2 hover:text-ink hover:border-line"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
