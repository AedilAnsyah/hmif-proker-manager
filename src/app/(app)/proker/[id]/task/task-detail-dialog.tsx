"use client";

import { useState } from "react";
import {
  addChecklistItemAction,
  toggleChecklistItemAction,
  deleteChecklistItemAction,
  addTaskLinkAction,
  deleteTaskLinkAction,
  deleteTaskAction,
} from "@/lib/actions/proker";
import { X, CheckSquare, Square, Trash2, Plus, ExternalLink, Calendar, Users } from "lucide-react";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import type { TaskRowData } from "./task-row";

interface ChecklistItem {
  id: string;
  text: string;
  is_done: boolean;
}

interface TaskLinkItem {
  id: string;
  url: string;
  label: string | null;
}

export function TaskDetailDialog({
  task,
  checklists,
  links,
  description,
  canManage,
  canUpdateStatus,
  onClose,
}: {
  task: TaskRowData;
  checklists: ChecklistItem[];
  links: TaskLinkItem[];
  description: string | null;
  canManage: boolean;
  canUpdateStatus: boolean;
  onClose: () => void;
}) {
  const [newChecklistText, setNewChecklistText] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Checklist
  async function handleAddChecklist(e: React.FormEvent) {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    setIsSubmitting(true);
    const res = await addChecklistItemAction(task.id, newChecklistText, task.proker_id);
    setIsSubmitting(false);
    if (res.ok) {
      setNewChecklistText("");
      toast.success("Item checklist ditambahkan");
    } else {
      toast.error(res.error || "Gagal menambahkan checklist");
    }
  }

  async function handleToggleChecklist(item: ChecklistItem) {
    const res = await toggleChecklistItemAction(item.id, !item.is_done, task.proker_id);
    if (!res.ok) toast.error(res.error || "Gagal mengubah status item");
  }

  async function handleDeleteChecklist(itemId: string) {
    const res = await deleteChecklistItemAction(itemId, task.proker_id);
    if (res.ok) toast.success("Item dihapus");
    else toast.error(res.error || "Gagal menghapus item");
  }

  // 2. Links
  async function handleAddLink(e: React.FormEvent) {
    e.preventDefault();
    if (!newLinkUrl.trim()) return;
    setIsSubmitting(true);
    const res = await addTaskLinkAction(task.id, newLinkUrl, newLinkLabel, task.proker_id);
    setIsSubmitting(false);
    if (res.ok) {
      setNewLinkUrl("");
      setNewLinkLabel("");
      toast.success("Tautan lampiran ditambahkan");
    } else {
      toast.error(res.error || "Gagal menambahkan link");
    }
  }

  async function handleDeleteLink(linkId: string) {
    const res = await deleteTaskLinkAction(linkId, task.proker_id);
    if (res.ok) toast.success("Tautan dihapus");
    else toast.error(res.error || "Gagal menghapus tautan");
  }

  // 3. Delete Task
  async function handleDeleteTask() {
    if (!confirm(`Hapus task "${task.title}" secara permanen?`)) return;
    const res = await deleteTaskAction(task.id, task.proker_id);
    if (res.ok) {
      toast.success("Task dihapus");
      onClose();
    } else {
      toast.error(res.error || "Gagal menghapus task");
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-bg border border-line rounded-lg w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header Modal */}
        <div className="p-4 border-b border-line flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.06em] text-ink-3">
              {task.division_name}
            </span>
            <h3 className="font-bold text-base text-ink mt-0.5">{task.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-ink-3 hover:text-ink hover:bg-surface"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="p-4 overflow-y-auto space-y-5 text-sm flex-1">
          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-xs text-ink-2 bg-surface p-3 rounded-md border border-line">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-ink-3" />
              <span>Deadline: {task.deadline ? formatDate(task.deadline) : "Tidak ada"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-ink-3" />
              <span>
                Assignee:{" "}
                {task.assignees.length === 0
                  ? "Seluruh Divisi"
                  : task.assignees.map((a) => a.full_name).join(", ")}
              </span>
            </div>
          </div>

          {/* Deskripsi */}
          {description && (
            <div>
              <h4 className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-2 mb-1.5">
                Deskripsi
              </h4>
              <p className="text-xs text-ink whitespace-pre-line leading-relaxed bg-bg border border-line p-3 rounded-md">
                {description}
              </p>
            </div>
          )}

          {/* Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-2">
                Checklist ({checklists.filter((c) => c.is_done).length}/{checklists.length})
              </h4>
            </div>

            <div className="space-y-1.5">
              {checklists.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2 rounded border border-line bg-bg text-xs"
                >
                  <button
                    type="button"
                    disabled={!canUpdateStatus}
                    onClick={() => handleToggleChecklist(c)}
                    className="flex items-center gap-2 flex-1 text-left"
                  >
                    {c.is_done ? (
                      <CheckSquare className="h-4 w-4 text-ink shrink-0" />
                    ) : (
                      <Square className="h-4 w-4 text-ink-3 shrink-0" />
                    )}
                    <span className={c.is_done ? "line-through text-ink-3" : "text-ink"}>
                      {c.text}
                    </span>
                  </button>

                  {canUpdateStatus && (
                    <button
                      type="button"
                      onClick={() => handleDeleteChecklist(c.id)}
                      className="p-1 text-danger/70 hover:text-danger rounded"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}

              {canUpdateStatus && (
                <form onSubmit={handleAddChecklist} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    placeholder="Tambah item checklist…"
                    className="flex-1 h-9 px-3 text-xs rounded-md border border-line bg-bg focus-visible:outline-none focus-visible:border-ink"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !newChecklistText.trim()}
                    className="h-9 px-3 text-xs font-semibold bg-surface border border-line-strong hover:bg-bg rounded-md text-ink disabled:opacity-50"
                  >
                    Tambah
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Links / Lampiran */}
          <div>
            <h4 className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-2 mb-2">
              Lampiran Link / Dokumen ({links.length})
            </h4>

            <div className="space-y-1.5">
              {links.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between p-2 rounded border border-line bg-bg text-xs"
                >
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-accent-hover hover:underline truncate flex-1 font-medium"
                  >
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    <span>{l.label || l.url}</span>
                  </a>

                  {canUpdateStatus && (
                    <button
                      type="button"
                      onClick={() => handleDeleteLink(l.id)}
                      className="p-1 text-danger/70 hover:text-danger rounded ml-2"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}

              {canUpdateStatus && (
                <form onSubmit={handleAddLink} className="space-y-2 pt-1 border-t border-line mt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="url"
                      required
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      placeholder="https://..."
                      className="h-9 px-3 text-xs rounded-md border border-line bg-bg focus-visible:outline-none focus-visible:border-ink"
                    />
                    <input
                      type="text"
                      value={newLinkLabel}
                      onChange={(e) => setNewLinkLabel(e.target.value)}
                      placeholder="Label (opsional, mis. Draft Proposal)"
                      className="h-9 px-3 text-xs rounded-md border border-line bg-bg focus-visible:outline-none focus-visible:border-ink"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting || !newLinkUrl.trim()}
                    className="h-8 px-3 text-xs font-semibold bg-surface border border-line-strong hover:bg-bg rounded-md text-ink disabled:opacity-50 inline-flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Tempel Link
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        {canManage && (
          <div className="p-3 bg-surface border-t border-line flex justify-between items-center">
            <button
              type="button"
              onClick={handleDeleteTask}
              className="text-xs text-danger hover:underline inline-flex items-center gap-1 font-medium"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Hapus Task
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-4 text-xs font-semibold rounded-md bg-ink text-white hover:bg-ink/90"
            >
              Selesai
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
