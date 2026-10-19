"use client";

import { useState } from "react";
import { createTaskAction } from "@/lib/actions/proker";
import { TaskRow, type TaskRowData } from "./task-row";
import { TaskDetailDialog } from "./task-detail-dialog";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

interface DivisionItem {
  id: string;
  name: string;
}

interface MemberOption {
  id: string;
  full_name: string;
  division_id: string | null;
}

interface JobdeskOption {
  id: string;
  division_id: string;
  title: string;
}

interface TaskFullItem extends TaskRowData {
  description: string | null;
  jobdesk_id: string | null;
  checklists: { id: string; text: string; is_done: boolean }[];
  links: { id: string; url: string; label: string | null }[];
}

export function TaskManager({
  prokerId,
  divisions,
  tasks,
  members,
  jobdesks,
  canManageAny,
}: {
  prokerId: string;
  divisions: DivisionItem[];
  tasks: TaskFullItem[];
  members: MemberOption[];
  jobdesks: JobdeskOption[];
  canManageAny: boolean;
}) {
  // Filters
  const [search, setSearch] = useState("");
  const [filterDiv, setFilterDiv] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedTask, setSelectedTask] = useState<TaskFullItem | null>(null);

  // Modal Create
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createDivisionId, setCreateDivisionId] = useState(divisions[0]?.id || "");
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);

  // Ringkasan Count
  const totalTasks = tasks.length;
  const belumDimulaiCount = tasks.filter((t) => t.status === "belum_dimulai").length;
  const onProgressCount = tasks.filter((t) => t.status === "on_progress").length;
  const selesaiCount = tasks.filter((t) => t.status === "selesai").length;

  // Filtered Tasks
  const filtered = tasks.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchDiv = !filterDiv || t.division_id === filterDiv;
    const matchStatus = !filterStatus || t.status === filterStatus;
    return matchSearch && matchDiv && matchStatus;
  });

  // Handle Create Task
  async function handleCreate(formData: FormData) {
    const res = await createTaskAction(formData);
    if (res.ok) {
      toast.success("Task baru berhasil dibuat");
      setShowCreateModal(false);
      setSelectedAssignees([]);
    } else {
      toast.error(res.error || "Gagal membuat task");
    }
  }

  // Anggota yang relevan untuk divisi yang dipilih di form
  const divisionMembers = members.filter(
    (m) => m.division_id === createDivisionId || !m.division_id
  );
  const divisionJobdesks = jobdesks.filter((j) => j.division_id === createDivisionId);

  return (
    <div className="space-y-6">
      {/* 1. Ringkasan Jumlah Per Status */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-lg border border-line bg-bg">
          <span className="text-[11px] font-mono uppercase tracking-[0.06em] text-ink-3">Total</span>
          <p className="text-xl font-bold font-mono text-ink mt-0.5">{totalTasks}</p>
        </div>
        <div className="p-3 rounded-lg border border-line bg-bg">
          <span className="text-[11px] font-mono uppercase tracking-[0.06em] text-ink-3">Belum Dimulai</span>
          <p className="text-xl font-bold font-mono text-ink mt-0.5">{belumDimulaiCount}</p>
        </div>
        <div className="p-3 rounded-lg border border-accent bg-accent-soft">
          <span className="text-[11px] font-mono uppercase tracking-[0.06em] text-ink-2 font-medium">On Progress</span>
          <p className="text-xl font-bold font-mono text-ink mt-0.5">{onProgressCount}</p>
        </div>
        <div className="p-3 rounded-lg border border-ink bg-surface">
          <span className="text-[11px] font-mono uppercase tracking-[0.06em] text-ink font-medium">Selesai</span>
          <p className="text-xl font-bold font-mono text-ink mt-0.5">{selesaiCount}</p>
        </div>
      </div>

      {/* 2. Controls & Search Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-3 text-ink-3" />
            <input
              type="text"
              placeholder="Cari task…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 text-sm rounded-md border border-line bg-bg focus-visible:outline-none focus-visible:border-ink"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterDiv}
              onChange={(e) => setFilterDiv(e.target.value)}
              className="h-10 px-2.5 text-xs rounded-md border border-line bg-bg text-ink focus-visible:outline-none focus-visible:border-ink"
            >
              <option value="">Semua Divisi</option>
              {divisions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-10 px-2.5 text-xs rounded-md border border-line bg-bg text-ink focus-visible:outline-none focus-visible:border-ink"
            >
              <option value="">Semua Status</option>
              <option value="belum_dimulai">Belum Dimulai</option>
              <option value="on_progress">On Progress</option>
              <option value="selesai">Selesai</option>
            </select>
          </div>
        </div>

        {canManageAny && (
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="h-10 px-4 text-xs font-semibold bg-accent text-on-accent hover:bg-accent-hover rounded-md transition-colors inline-flex items-center justify-center gap-1.5 shrink-0"
          >
            <Plus className="h-4 w-4" />
            Tambah Task
          </button>
        )}
      </div>

      {/* 3. Daftar Baris Task (DESIGN.md §6 Baris Task) */}
      <div className="border border-line rounded-lg bg-bg overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <h3 className="text-sm font-semibold text-ink">Tidak ada task ditemukan</h3>
            <p className="text-xs text-ink-2 mt-0.5">
              Sesuaikan filter atau buat task baru untuk proker ini.
            </p>
          </div>
        ) : (
          filtered.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onOpenDetail={() => setSelectedTask(task)}
            />
          ))
        )}
      </div>

      {/* 4. MODAL DETAIL TASK (Checklist + Link) */}
      {selectedTask && (
        <TaskDetailDialog
          task={selectedTask}
          checklists={selectedTask.checklists}
          links={selectedTask.links}
          description={selectedTask.description}
          canManage={selectedTask.can_update_status}
          canUpdateStatus={selectedTask.can_update_status}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {/* 5. MODAL TAMBAH TASK */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-bg border border-line rounded-lg w-full max-w-lg p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold text-base text-ink">Tambah Task Baru</h3>

            <form action={handleCreate} className="space-y-3">
              <input type="hidden" name="prokerId" value={prokerId} />

              <div>
                <label className="block text-xs font-medium text-ink mb-1">
                  Judul Task <span className="text-danger">*</span>
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  placeholder="Contoh: Menyiapkan formulir pendaftaran peserta"
                  className="w-full h-10 px-3 text-sm rounded-md border border-line bg-bg focus-visible:outline-none focus-visible:border-ink"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">
                    Divisi <span className="text-danger">*</span>
                  </label>
                  <select
                    name="divisionId"
                    required
                    value={createDivisionId}
                    onChange={(e) => setCreateDivisionId(e.target.value)}
                    className="w-full h-10 px-2.5 text-xs rounded-md border border-line bg-bg text-ink focus-visible:outline-none focus-visible:border-ink"
                  >
                    {divisions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink mb-1">
                    Terkait Jobdesk
                  </label>
                  <select
                    name="jobdeskId"
                    className="w-full h-10 px-2.5 text-xs rounded-md border border-line bg-bg text-ink focus-visible:outline-none focus-visible:border-ink"
                  >
                    <option value="">Tidak ada / Mandiri</option>
                    {divisionJobdesks.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink mb-1">
                  Tanggal Deadline
                </label>
                <input
                  name="deadline"
                  type="date"
                  className="w-full h-10 px-3 text-xs rounded-md border border-line bg-bg text-ink focus-visible:outline-none focus-visible:border-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink mb-1">
                  Ditugaskan ke (Kosongkan jika seluruh divisi)
                </label>
                <div className="max-h-32 overflow-y-auto border border-line rounded-md p-2 space-y-1 bg-surface">
                  {divisionMembers.map((m) => {
                    const isSelected = selectedAssignees.includes(m.id);
                    return (
                      <label
                        key={m.id}
                        className="flex items-center gap-2 text-xs text-ink cursor-pointer hover:bg-bg p-1 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAssignees([...selectedAssignees, m.id]);
                            } else {
                              setSelectedAssignees(selectedAssignees.filter((id) => id !== m.id));
                            }
                          }}
                        />
                        <span>{m.full_name}</span>
                      </label>
                    );
                  })}
                </div>
                <input
                  type="hidden"
                  name="assigneeIds"
                  value={JSON.stringify(selectedAssignees)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink mb-1">Deskripsi Tambahan</label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Catatan pengerjaan atau instruksi spesifik"
                  className="w-full p-2.5 text-xs rounded-md border border-line bg-bg focus-visible:outline-none focus-visible:border-ink"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="h-9 px-3 text-xs border border-line rounded-md hover:bg-surface text-ink-2"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 text-xs font-semibold bg-accent text-on-accent rounded-md hover:bg-accent-hover"
                >
                  Buat Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
