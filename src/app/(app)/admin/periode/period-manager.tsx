"use client";

import { useState } from "react";
import { createPeriodAction, setCurrentPeriodAction } from "@/lib/actions/admin";
import { toast } from "sonner";

interface Period {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
}

export function PeriodManager({ periods }: { periods: Period[] }) {
  const [showForm, setShowForm] = useState(false);

  async function handleCreate(formData: FormData) {
    const result = await createPeriodAction(formData);
    if (result.ok) {
      toast.success("Periode berhasil dibuat");
      setShowForm(false);
    } else {
      toast.error(result.error);
    }
  }

  async function handleSetCurrent(id: string) {
    const result = await setCurrentPeriodAction(id);
    if (result.ok) toast.success("Periode aktif diperbarui");
    else toast.error(result.error);
  }

  return (
    <div>
      {/* Period list */}
      {periods.length === 0 ? (
        <div className="border border-line rounded-lg p-8 text-center mb-4">
          <h3 className="text-base font-semibold text-ink">Belum ada periode</h3>
          <p className="mt-1 text-sm text-ink-2">Buat periode pertama untuk memulai.</p>
        </div>
      ) : (
        <div className="space-y-2 mb-6">
          {periods.map((period) => (
            <div
              key={period.id}
              className={`border rounded-lg p-4 flex items-center justify-between ${period.is_current ? "border-accent bg-accent-soft" : "border-line"}`}
            >
              <div>
                <span className="font-semibold text-ink">{period.name}</span>
                {period.is_current && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent text-on-accent">
                    Aktif
                  </span>
                )}
                {(period.start_date || period.end_date) && (
                  <p className="text-xs text-ink-3 font-mono mt-0.5">
                    {period.start_date ?? "?"} — {period.end_date ?? "?"}
                  </p>
                )}
              </div>
              {!period.is_current && (
                <button
                  onClick={() => handleSetCurrent(period.id)}
                  className="text-xs text-ink-2 hover:text-ink underline"
                >
                  Jadikan aktif
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create form */}
      {showForm ? (
        <form action={handleCreate} className="border border-line rounded-lg p-4 space-y-3 max-w-md">
          <h3 className="text-base font-semibold text-ink">Periode Baru</h3>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-ink mb-1">Nama</label>
            <input id="name" name="name" type="text" required placeholder="2026/2027"
              className="flex h-10 w-full rounded-md border border-line bg-bg px-3 text-sm focus-visible:outline-none focus-visible:border-ink" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-ink mb-1">Mulai</label>
              <input id="startDate" name="startDate" type="date"
                className="flex h-10 w-full rounded-md border border-line bg-bg px-3 text-sm focus-visible:outline-none focus-visible:border-ink" />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-ink mb-1">Selesai</label>
              <input id="endDate" name="endDate" type="date"
                className="flex h-10 w-full rounded-md border border-line bg-bg px-3 text-sm focus-visible:outline-none focus-visible:border-ink" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" name="isCurrent" className="rounded" />
            Jadikan periode aktif
          </label>
          <div className="flex gap-2">
            <button type="submit" className="h-10 px-4 bg-accent text-on-accent font-semibold text-sm rounded-md hover:bg-accent-hover transition-colors">
              Simpan
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="h-10 px-4 border border-line-strong text-sm rounded-md hover:bg-surface transition-colors">
              Batal
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="h-10 px-4 bg-accent text-on-accent font-semibold text-sm rounded-md hover:bg-accent-hover transition-colors"
        >
          Tambah periode
        </button>
      )}
    </div>
  );
}
