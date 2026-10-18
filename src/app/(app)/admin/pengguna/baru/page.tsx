"use client";

import { createUserAction } from "@/lib/actions/admin";
import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BuatAkunPage() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { ok?: boolean; error?: string } | null, formData: FormData) => {
      return await createUserAction(formData);
    },
    null
  );

  return (
    <div className="max-w-lg">
      <Link href="/admin/pengguna" className="inline-flex items-center gap-1 text-sm text-ink-2 hover:text-ink mb-4">
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </Link>

      <h1 className="text-2xl font-bold text-ink mb-6">Buat Akun Baru</h1>

      {state?.ok && (
        <div className="mb-4 p-3 bg-accent-soft border border-accent/20 rounded-md text-sm text-ink">
          Akun berhasil dibuat. Password awal = NIM.
        </div>
      )}

      {state?.error && (
        <div className="mb-4 p-3 bg-danger-soft border border-danger/20 rounded-md text-sm text-danger" role="alert">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-ink mb-1.5">
            Nama lengkap <span className="text-danger">*</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            disabled={isPending}
            className="flex h-11 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus-visible:outline-none focus-visible:border-ink focus-visible:ring-1 focus-visible:ring-ink disabled:opacity-50"
          />
          <p className="mt-1 text-xs text-ink-3">Username akan dibuat otomatis dari nama (huruf kecil).</p>
        </div>

        <div>
          <label htmlFor="nim" className="block text-sm font-medium text-ink mb-1.5">
            NIM <span className="text-danger">*</span>
          </label>
          <input
            id="nim"
            name="nim"
            type="text"
            required
            inputMode="numeric"
            disabled={isPending}
            className="flex h-11 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus-visible:outline-none focus-visible:border-ink focus-visible:ring-1 focus-visible:ring-ink disabled:opacity-50"
          />
          <p className="mt-1 text-xs text-ink-3">Dipakai sebagai password awal. Tidak terlihat oleh user lain.</p>
        </div>

        <div>
          <label htmlFor="angkatan" className="block text-sm font-medium text-ink mb-1.5">
            Angkatan <span className="text-danger">*</span>
          </label>
          <input
            id="angkatan"
            name="angkatan"
            type="number"
            required
            min={2000}
            max={2100}
            disabled={isPending}
            className="flex h-11 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus-visible:outline-none focus-visible:border-ink focus-visible:ring-1 focus-visible:ring-ink disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="globalRole" className="block text-sm font-medium text-ink mb-1.5">
            Tipe akun
          </label>
          <select
            id="globalRole"
            name="globalRole"
            disabled={isPending}
            className="flex h-11 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:border-ink"
          >
            <option value="member">Anggota HMIF</option>
            <option value="bph">BPH (Ketua/Waketum)</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-11 bg-accent text-on-accent font-semibold rounded-md hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {isPending ? "Membuat akun…" : "Buat akun"}
        </button>
      </form>
    </div>
  );
}
