"use client";

import { createProkerAction } from "@/lib/actions/admin";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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

export function CreateProkerForm({
  periods,
  members,
}: {
  periods: Period[];
  members: Member[];
}) {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(
    async (_prev: { ok?: boolean; error?: string } | null, formData: FormData) => {
      const result = await createProkerAction(formData);
      if (result.ok) {
        router.push("/");
        return result;
      }
      return result;
    },
    null
  );

  const currentPeriod = periods.find((p) => p.is_current);

  return (
    <>
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-ink-2 hover:text-ink mb-4">
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </Link>

      {state?.error && (
        <div className="mb-4 p-3 bg-danger-soft border border-danger/20 rounded-md text-sm text-danger" role="alert">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-ink mb-1.5">
            Nama proker <span className="text-danger">*</span>
          </label>
          <input id="name" name="name" type="text" required disabled={isPending}
            className="flex h-11 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:border-ink focus-visible:ring-1 focus-visible:ring-ink disabled:opacity-50" />
        </div>

        <div>
          <label htmlFor="periodId" className="block text-sm font-medium text-ink mb-1.5">
            Periode <span className="text-danger">*</span>
          </label>
          <select id="periodId" name="periodId" required disabled={isPending}
            defaultValue={currentPeriod?.id ?? ""}
            className="flex h-11 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:border-ink disabled:opacity-50">
            <option value="">Pilih periode</option>
            {periods.map((p) => (
              <option key={p.id} value={p.id}>{p.name} {p.is_current ? "(Aktif)" : ""}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-ink mb-1.5">Deskripsi</label>
          <textarea id="description" name="description" rows={3} disabled={isPending}
            className="flex w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:border-ink disabled:opacity-50" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-ink mb-1.5">Tanggal mulai</label>
            <input id="startDate" name="startDate" type="date" disabled={isPending}
              className="flex h-11 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:border-ink disabled:opacity-50" />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-ink mb-1.5">Tanggal selesai</label>
            <input id="endDate" name="endDate" type="date" disabled={isPending}
              className="flex h-11 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:border-ink disabled:opacity-50" />
          </div>
        </div>

        <div>
          <label htmlFor="picId" className="block text-sm font-medium text-ink mb-1.5">
            Person in Charge (PIC) <span className="text-danger">*</span>
          </label>
          <select id="picId" name="picId" required disabled={isPending}
            className="flex h-11 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:border-ink disabled:opacity-50">
            <option value="">Pilih PIC</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.full_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="ketupelId" className="block text-sm font-medium text-ink mb-1.5">
            Ketua Pelaksana <span className="text-danger">*</span>
          </label>
          <select id="ketupelId" name="ketupelId" required disabled={isPending}
            className="flex h-11 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:border-ink disabled:opacity-50">
            <option value="">Pilih Ketupel</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.full_name}</option>
            ))}
          </select>
        </div>

        <input type="hidden" name="scIds" value="[]" />

        <button type="submit" disabled={isPending}
          className="w-full h-11 bg-accent text-on-accent font-semibold rounded-md hover:bg-accent-hover transition-colors disabled:opacity-50">
          {isPending ? "Membuat proker…" : "Buat proker"}
        </button>
      </form>
    </>
  );
}
