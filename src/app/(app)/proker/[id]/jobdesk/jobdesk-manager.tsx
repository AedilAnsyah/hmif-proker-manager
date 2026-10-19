"use client";

import { useState } from "react";
import {
  createJobdeskAction,
  updateJobdeskAction,
  deleteJobdeskAction,
} from "@/lib/actions/proker";
import { Plus, Trash2, Edit2, Briefcase } from "lucide-react";
import { toast } from "sonner";

interface DivisionItem {
  id: string;
  name: string;
  kind: "sekretaris" | "bendahara" | "custom";
}

interface JobdeskItem {
  id: string;
  division_id: string;
  title: string;
  description: string | null;
  sort_order: number;
}

export function JobdeskManager({
  divisions,
  jobdesks,
  isManager,
}: {
  divisions: DivisionItem[];
  jobdesks: JobdeskItem[];
  isManager: boolean;
}) {
  const [activeDivId, setActiveDivId] = useState<string>(divisions[0]?.id || "");
  const [showAdd, setShowAdd] = useState(false);
  const [editingJobdesk, setEditingJobdesk] = useState<JobdeskItem | null>(null);

  const activeDiv = divisions.find((d) => d.id === activeDivId) || divisions[0];
  const currentJobdesks = jobdesks.filter((j) => j.division_id === activeDivId);

  // 1. Tambah Jobdesk
  async function handleAdd(formData: FormData) {
    const res = await createJobdeskAction(formData);
    if (res.ok) {
      toast.success("Jobdesk berhasil ditambahkan");
      setShowAdd(false);
    } else {
      toast.error(res.error || "Gagal menambahkan jobdesk");
    }
  }

  // 2. Update Jobdesk
  async function handleUpdate(formData: FormData) {
    const res = await updateJobdeskAction(formData);
    if (res.ok) {
      toast.success("Jobdesk berhasil diperbarui");
      setEditingJobdesk(null);
    } else {
      toast.error(res.error || "Gagal memperbarui jobdesk");
    }
  }

  // 3. Hapus Jobdesk
  async function handleDelete(j: JobdeskItem) {
    if (!confirm(`Hapus jobdesk "${j.title}"?`)) return;
    const res = await deleteJobdeskAction(j.id, j.division_id);
    if (res.ok) toast.success("Jobdesk berhasil dihapus");
    else toast.error(res.error || "Gagal menghapus jobdesk");
  }

  return (
    <div className="space-y-6">
      {/* Tab Divisi */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-line">
        {divisions.map((d) => (
          <button
            key={d.id}
            onClick={() => setActiveDivId(d.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
              activeDivId === d.id
                ? "bg-ink text-white"
                : "text-ink-2 hover:text-ink hover:bg-surface"
            }`}
          >
            {d.name}
          </button>
        ))}
      </div>

      {/* Konten Jobdesk Divisi Terpilih */}
      {activeDiv && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-ink">Jobdesk Divisi {activeDiv.name}</h2>
              <p className="text-xs text-ink-3">
                {currentJobdesks.length} poin tugas dan tanggung jawab divisi ini.
              </p>
            </div>

            {isManager && (
              <button
                onClick={() => setShowAdd(true)}
                className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold rounded-md bg-accent text-on-accent hover:bg-accent-hover transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah Jobdesk
              </button>
            )}
          </div>

          {currentJobdesks.length === 0 ? (
            <div className="border border-line rounded-lg p-10 text-center flex flex-col items-center justify-center">
              <div className="h-10 w-10 rounded-full bg-surface border border-line flex items-center justify-center text-ink-3 mb-2">
                <Briefcase className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-ink">Belum ada jobdesk</h3>
              <p className="text-xs text-ink-2 mt-0.5">
                Tambahkan poin jobdesk untuk memberikan kejelasan tugas panitia.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {currentJobdesks.map((j, idx) => (
                <div
                  key={j.id}
                  className="p-3.5 rounded-lg border border-line bg-bg hover:border-ink/20 transition-colors flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="font-mono text-xs font-bold text-ink-3 mt-0.5">
                      {idx + 1}.
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-ink">{j.title}</h4>
                      {j.description && (
                        <p className="text-xs text-ink-2 mt-1 leading-relaxed whitespace-pre-line">
                          {j.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {isManager && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setEditingJobdesk(j)}
                        title="Edit Jobdesk"
                        className="p-1.5 text-ink-2 hover:text-ink rounded hover:bg-surface"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(j)}
                        title="Hapus Jobdesk"
                        className="p-1.5 text-danger/80 hover:text-danger rounded hover:bg-danger-soft"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DIALOG: TAMBAH JOBDESK */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-bg border border-line rounded-lg w-full max-w-md p-5 space-y-4">
            <h3 className="font-semibold text-base text-ink">
              Tambah Jobdesk ({activeDiv?.name})
            </h3>
            <form action={handleAdd} className="space-y-3">
              <input type="hidden" name="divisionId" value={activeDivId} />
              <div>
                <label className="block text-xs font-medium text-ink mb-1">
                  Judul Jobdesk <span className="text-danger">*</span>
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  placeholder="Contoh: Menyusun rundown acara utama"
                  className="w-full h-10 px-3 text-sm rounded-md border border-line bg-bg focus-visible:outline-none focus-visible:border-ink"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink mb-1">Deskripsi & Rincian</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Penjelasan alur kerja atau ekspektasi hasil"
                  className="w-full p-2.5 text-sm rounded-md border border-line bg-bg focus-visible:outline-none focus-visible:border-ink"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="h-9 px-3 text-xs border border-line rounded-md hover:bg-surface text-ink-2"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 text-xs font-semibold bg-accent text-on-accent rounded-md hover:bg-accent-hover"
                >
                  Simpan Jobdesk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIALOG: EDIT JOBDESK */}
      {editingJobdesk && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-bg border border-line rounded-lg w-full max-w-md p-5 space-y-4">
            <h3 className="font-semibold text-base text-ink">Edit Jobdesk</h3>
            <form action={handleUpdate} className="space-y-3">
              <input type="hidden" name="id" value={editingJobdesk.id} />
              <input type="hidden" name="divisionId" value={editingJobdesk.division_id} />
              <div>
                <label className="block text-xs font-medium text-ink mb-1">
                  Judul Jobdesk <span className="text-danger">*</span>
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  defaultValue={editingJobdesk.title}
                  className="w-full h-10 px-3 text-sm rounded-md border border-line bg-bg focus-visible:outline-none focus-visible:border-ink"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink mb-1">Deskripsi & Rincian</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingJobdesk.description || ""}
                  className="w-full p-2.5 text-sm rounded-md border border-line bg-bg focus-visible:outline-none focus-visible:border-ink"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingJobdesk(null)}
                  className="h-9 px-3 text-xs border border-line rounded-md hover:bg-surface text-ink-2"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 text-xs font-semibold bg-accent text-on-accent rounded-md hover:bg-accent-hover"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
