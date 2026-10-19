"use client";

import { updateProkerAction, deleteProkerAction } from "@/lib/actions/admin";
import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";

interface Period {
  id: string;
  name: string;
  is_current: boolean;
}

interface Member {
  id: string;
  full_name: string;
  global_role: string;
}

interface ProkerData {
  id: string;
  name: string;
  description: string | null;
  status: "planning" | "active" | "done";
  start_date: string | null;
  end_date: string | null;
  period_id: string;
}

export function EditProkerForm({
  proker,
  periods,
  members,
  initialPicId,
  initialKetupelId,
  initialScIds,
}: {
  proker: ProkerData;
  periods: Period[];
  members: Member[];
  initialPicId: string;
  initialKetupelId: string;
  initialScIds: string[];
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (_prev: { ok?: boolean; error?: string } | null, formData: FormData) => {
      const result = await updateProkerAction(formData);
      if (result.ok) {
        router.push("/proker/semua");
        return result;
      }
      return result;
    },
    null
  );

  async function handleDelete() {
    if (!confirm(`Hapus proker "${proker.name}" secara permanen? Data yang sudah dibuat tidak bisa dikembalikan.`)) {
      return;
    }
    setIsDeleting(true);
    const res = await deleteProkerAction(proker.id);
    if (res.ok) {
      router.push("/proker/semua");
    } else {
      alert(res.error || "Gagal menghapus proker");
      setIsDeleting(false);
    }
  }

  return (
    <>
      <Link href="/proker/semua" className="inline-flex items-center gap-1 text-sm text-ink-2 hover:text-ink mb-4">
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Semua Proker
      </Link>

      {state?.error && (
        <div className="mb-4 p-3 bg-danger-soft border border-danger/20 rounded-md text-sm text-danger" role="alert">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="id" value={proker.id} />

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-ink mb-1.5">
            Nama proker <span className="text-danger">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={proker.name}
            disabled={isPending || isDeleting}
            className="flex h-11 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:border-ink focus-visible:ring-1 focus-visible:ring-ink disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="periodId" className="block text-sm font-medium text-ink mb-1.5">
            Periode <span className="text-danger">*</span>
          </label>
          <select
            id="periodId"
            name="periodId"
            required
            defaultValue={proker.period_id}
            disabled={isPending || isDeleting}
            className="flex h-11 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:border-ink disabled:opacity-50"
          >
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.is_current ? "(Aktif)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-ink mb-1.5">
            Status Proker
          </label>
          <select
            id="status"
            name="status"
            defaultValue={proker.status}
            disabled={isPending || isDeleting}
            className="flex h-11 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:border-ink disabled:opacity-50"
          >
            <option value="planning">Perencanaan</option>
            <option value="active">Aktif</option>
            <option value="done">Selesai</option>
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-ink mb-1.5">
            Deskripsi
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={proker.description ?? ""}
            disabled={isPending || isDeleting}
            className="flex w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:border-ink disabled:opacity-50"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-ink mb-1.5">
              Tanggal mulai
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              defaultValue={proker.start_date ?? ""}
              disabled={isPending || isDeleting}
              className="flex h-11 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:border-ink disabled:opacity-50"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-ink mb-1.5">
              Tanggal selesai
            </label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              defaultValue={proker.end_date ?? ""}
              disabled={isPending || isDeleting}
              className="flex h-11 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:border-ink disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <label htmlFor="picId" className="block text-sm font-medium text-ink mb-1.5">
            Person in Charge (PIC) <span className="text-danger">*</span>
          </label>
          <select
            id="picId"
            name="picId"
            required
            defaultValue={initialPicId}
            disabled={isPending || isDeleting}
            className="flex h-11 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:border-ink disabled:opacity-50"
          >
            <option value="">Pilih PIC</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="ketupelId" className="block text-sm font-medium text-ink mb-1.5">
            Ketua Pelaksana <span className="text-danger">*</span>
          </label>
          <select
            id="ketupelId"
            name="ketupelId"
            required
            defaultValue={initialKetupelId}
            disabled={isPending || isDeleting}
            className="flex h-11 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:border-ink disabled:opacity-50"
          >
            <option value="">Pilih Ketupel</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name}
              </option>
            ))}
          </select>
        </div>

        <input type="hidden" name="scIds" value={JSON.stringify(initialScIds)} />

        <div className="pt-2 flex flex-col gap-3">
          <button
            type="submit"
            disabled={isPending || isDeleting}
            className="w-full h-11 bg-accent text-on-accent font-semibold rounded-md hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {isPending ? "Menyimpan perubahan…" : "Simpan Perubahan"}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending || isDeleting}
            className="w-full h-11 flex items-center justify-center gap-2 border border-danger/30 text-danger hover:bg-danger-soft text-sm font-semibold rounded-md transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? "Menghapus proker…" : "Hapus Proker"}
          </button>
        </div>
      </form>
    </>
  );
}
