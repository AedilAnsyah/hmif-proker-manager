"use client";

import { useState } from "react";
import { setTaskStatusAction } from "@/lib/actions/proker";
import { StatusChip, type TaskStatusValue } from "@/components/ui/status-chip";
import { daysUntilDeadline, formatDate } from "@/lib/format";
import { CheckSquare, Link as LinkIcon, Clock } from "lucide-react";
import { toast } from "sonner";

export interface TaskRowData {
  id: string;
  proker_id: string;
  division_id: string;
  division_name: string;
  title: string;
  status: TaskStatusValue;
  deadline: string | null;
  assignees: { id: string; full_name: string }[];
  checklist_total: number;
  checklist_done: number;
  links_count: number;
  can_update_status: boolean;
}

export function TaskRow({
  task,
  onOpenDetail,
}: {
  task: TaskRowData;
  onOpenDetail?: (task: TaskRowData) => void;
}) {
  const [showStatusSheet, setShowStatusSheet] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Status handling via RPC
  async function handleStatusChange(newStatus: TaskStatusValue) {
    if (newStatus === task.status) {
      setShowStatusSheet(false);
      return;
    }
    setIsUpdating(true);
    const res = await setTaskStatusAction(task.id, newStatus, task.proker_id);
    setIsUpdating(false);
    setShowStatusSheet(false);

    if (res.ok) {
      toast.success("Status diperbarui");
    } else {
      toast.error(res.error || "Gagal mengubah status");
    }
  }

  // Hitung status deadline
  let deadlineLabel = "";
  let isOverdue = false;
  let isUrgent = false;

  if (task.deadline) {
    if (task.status === "selesai") {
      deadlineLabel = formatDate(task.deadline);
    } else {
      const days = daysUntilDeadline(task.deadline);
      if (days < 0) {
        isOverdue = true;
        deadlineLabel = `Terlambat ${Math.abs(days)} hari`;
      } else if (days === 0) {
        isUrgent = true;
        deadlineLabel = "Hari ini";
      } else if (days <= 3) {
        isUrgent = true;
        deadlineLabel = `${days} hari lagi`;
      } else {
        deadlineLabel = formatDate(task.deadline);
      }
    }
  }

  // Border kiri 3px penanda terlambat / segera
  const borderLeftClass =
    task.status !== "selesai" && isOverdue
      ? "border-l-[3px] border-l-danger -ml-[3px]"
      : task.status !== "selesai" && isUrgent
      ? "border-l-[3px] border-l-accent -ml-[3px]"
      : "";

  return (
    <>
      <div
        className={`py-3 px-3 hover:bg-surface/50 transition-colors border-b border-line flex flex-col gap-1.5 ${borderLeftClass}`}
      >
        {/* Baris 1: Status Chip di kiri, Judul di tengah, Deadline di kanan */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 flex-1 min-w-0">
            <div className="shrink-0 mt-0.5">
              <StatusChip
                status={task.status}
                interactive={task.can_update_status}
                onClick={task.can_update_status ? () => setShowStatusSheet(true) : undefined}
              />
            </div>
            <button
              type="button"
              onClick={() => onOpenDetail?.(task)}
              className="text-left font-medium text-sm text-ink hover:underline truncate-2-lines flex-1"
            >
              {task.title}
            </button>
          </div>

          {/* Deadline */}
          {task.deadline && (
            <div className="shrink-0 text-right">
              {isOverdue && task.status !== "selesai" ? (
                <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-danger">
                  <Clock className="h-3 w-3" />
                  {deadlineLabel}
                </span>
              ) : isUrgent && task.status !== "selesai" ? (
                <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-accent-soft text-ink">
                  {deadlineLabel}
                </span>
              ) : (
                <span className="font-mono text-xs text-ink-2 uppercase">
                  {deadlineLabel}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Baris 2: Metadata (Divisi, Assignees, Checklist, Links) */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-ink-2 pl-[38px] sm:pl-0">
          <span className="font-medium text-ink-2">{task.division_name}</span>

          <span>•</span>
          <span className="truncate max-w-[200px]">
            {task.assignees.length === 0
              ? "Seluruh Divisi"
              : task.assignees.map((a) => a.full_name.split(" ")[0]).join(", ")}
          </span>

          {task.checklist_total > 0 && (
            <>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-ink-3">
                <CheckSquare className="h-3.5 w-3.5" />
                <span>
                  {task.checklist_done}/{task.checklist_total}
                </span>
              </span>
            </>
          )}

          {task.links_count > 0 && (
            <>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-ink-3">
                <LinkIcon className="h-3.5 w-3.5" />
                <span>{task.links_count}</span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* BOTTOM SHEET / DIALOG UBAH STATUS (TARGET < 30 DETIK DI HP) */}
      {showStatusSheet && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowStatusSheet(false)}
        >
          <div
            className="bg-bg border border-line rounded-t-xl sm:rounded-lg w-full max-w-sm p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-1 border-b border-line">
              <h3 className="font-semibold text-sm text-ink">Ubah Status Task</h3>
              <button
                type="button"
                onClick={() => setShowStatusSheet(false)}
                className="text-xs text-ink-3 hover:text-ink"
              >
                Tutup
              </button>
            </div>

            <p className="text-xs text-ink-2 line-clamp-1 font-medium">{task.title}</p>

            <div className="space-y-1.5 pt-1">
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleStatusChange("belum_dimulai")}
                className={`w-full h-11 px-3 rounded-md flex items-center justify-between text-xs font-semibold border transition-colors ${
                  task.status === "belum_dimulai"
                    ? "border-ink bg-surface text-ink"
                    : "border-line text-ink hover:bg-surface"
                }`}
              >
                <span>Belum Dimulai</span>
                <span className="h-2.5 w-2.5 rounded-full border border-line-strong" />
              </button>

              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleStatusChange("on_progress")}
                className={`w-full h-11 px-3 rounded-md flex items-center justify-between text-xs font-semibold border transition-colors ${
                  task.status === "on_progress"
                    ? "border-accent bg-accent text-on-accent"
                    : "border-line text-ink hover:bg-surface"
                }`}
              >
                <span>On Progress</span>
                <span className="h-2.5 w-2.5 rounded-full bg-accent" />
              </button>

              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleStatusChange("selesai")}
                className={`w-full h-11 px-3 rounded-md flex items-center justify-between text-xs font-semibold border transition-colors ${
                  task.status === "selesai"
                    ? "border-ink bg-ink text-white"
                    : "border-line text-ink hover:bg-surface"
                }`}
              >
                <span>Selesai</span>
                <span className="h-2.5 w-2.5 rounded-full bg-ink" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
