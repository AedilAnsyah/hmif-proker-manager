"use client";

import { useState } from "react";
import { TaskRow, type TaskRowData } from "../proker/[id]/task/task-row";
import { TaskDetailDialog } from "../proker/[id]/task/task-detail-dialog";
import { Search } from "lucide-react";

interface TugasFullItem extends TaskRowData {
  proker_name: string;
  description: string | null;
  checklists: { id: string; text: string; is_done: boolean }[];
  links: { id: string; url: string; label: string | null }[];
}

export function TugasSayaList({ tasks }: { tasks: TugasFullItem[] }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedTask, setSelectedTask] = useState<TugasFullItem | null>(null);

  const filtered = tasks.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.proker_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-3 text-ink-3" />
          <input
            type="text"
            placeholder="Cari tugas atau proker…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 text-sm rounded-md border border-line bg-bg focus-visible:outline-none focus-visible:border-ink"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-10 px-3 text-xs rounded-md border border-line bg-bg text-ink focus-visible:outline-none focus-visible:border-ink"
        >
          <option value="">Semua Status</option>
          <option value="belum_dimulai">Belum Dimulai</option>
          <option value="on_progress">On Progress</option>
          <option value="selesai">Selesai</option>
        </select>
      </div>

      <div className="border border-line rounded-lg bg-bg overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <h3 className="text-sm font-semibold text-ink">Tidak ada tugas</h3>
            <p className="text-xs text-ink-2 mt-0.5">
              Anda tidak memiliki tugas yang sesuai dengan filter ini.
            </p>
          </div>
        ) : (
          filtered.map((t) => (
            <div key={t.id} className="relative">
              <div className="px-3 pt-2 text-[11px] font-mono uppercase text-ink-3 tracking-wider">
                {t.proker_name}
              </div>
              <TaskRow task={t} onOpenDetail={() => setSelectedTask(t)} />
            </div>
          ))
        )}
      </div>

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
    </div>
  );
}
