"use client";

import { useState } from "react";
import { toggleUserActiveAction, resetPasswordAction } from "@/lib/actions/admin";
import { toast } from "sonner";

interface User {
  id: string;
  username: string;
  full_name: string;
  global_role: string;
  angkatan: number | null;
  is_active: boolean;
  must_change_password: boolean;
  created_at: string;
}

const roleLabels: Record<string, string> = {
  admin: "Admin",
  bph: "BPH",
  member: "Anggota",
  external: "Non-HMIF",
};

export function UserManagementTable({ users }: { users: User[] }) {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");

  const filtered = users.filter((u) => {
    const matchSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase());
    const matchRole = !filterRole || u.global_role === filterRole;
    return matchSearch && matchRole;
  });

  async function handleToggleActive(userId: string) {
    const result = await toggleUserActiveAction(userId);
    if (result.ok) toast.success("Status akun diperbarui");
    else toast.error(result.error);
  }

  async function handleReset(userId: string, name: string) {
    if (!confirm(`Reset password ${name} ke NIM?`)) return;
    const result = await resetPasswordAction(userId);
    if (result.ok) toast.success("Password direset ke NIM");
    else toast.error(result.error);
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center mb-4">
        <input
          type="text"
          placeholder="Cari nama atau username…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 flex-1 rounded-md border border-line bg-bg px-3 text-sm placeholder:text-ink-3 focus-visible:outline-none focus-visible:border-ink"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="h-10 rounded-md border border-line bg-bg px-3 text-sm text-ink"
        >
          <option value="">Semua tipe</option>
          <option value="admin">Admin</option>
          <option value="bph">BPH</option>
          <option value="member">Anggota</option>
          <option value="external">Non-HMIF</option>
        </select>
      </div>

      {/* Table (desktop) / Cards (mobile) */}
      {filtered.length === 0 ? (
        <div className="border border-line rounded-lg p-8 text-center">
          <p className="text-sm text-ink-2">Tidak ada pengguna ditemukan.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block border border-line rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface">
                  <th className="text-left px-4 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-2">Nama</th>
                  <th className="text-left px-4 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-2">Tipe</th>
                  <th className="text-left px-4 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-2">Angkatan</th>
                  <th className="text-left px-4 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-2">Status</th>
                  <th className="text-right px-4 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-t border-line">
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink">{user.full_name}</div>
                      <div className="text-xs text-ink-3">{user.username}</div>
                    </td>
                    <td className="px-4 py-3 text-ink-2">{roleLabels[user.global_role]}</td>
                    <td className="px-4 py-3 font-mono text-ink-2">{user.angkatan ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user.is_active ? "bg-surface text-ink" : "bg-danger-soft text-danger"}`}>
                        {user.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => handleToggleActive(user.id)}
                        className="text-xs text-ink-2 hover:text-ink underline"
                      >
                        {user.is_active ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                      <button
                        onClick={() => handleReset(user.id, user.full_name)}
                        className="text-xs text-danger hover:underline"
                      >
                        Reset
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-2">
            {filtered.map((user) => (
              <div key={user.id} className="border border-line rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-ink">{user.full_name}</div>
                    <div className="text-xs text-ink-3 mt-0.5">{user.username} · {roleLabels[user.global_role]} · {user.angkatan ?? "—"}</div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${user.is_active ? "bg-surface text-ink" : "bg-danger-soft text-danger"}`}>
                    {user.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
                <div className="mt-3 flex gap-3">
                  <button onClick={() => handleToggleActive(user.id)} className="text-xs text-ink-2 hover:text-ink underline">
                    {user.is_active ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                  <button onClick={() => handleReset(user.id, user.full_name)} className="text-xs text-danger hover:underline">
                    Reset password
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
