"use client";

import { useState } from "react";
import {
  createDivisionAction,
  deleteDivisionAction,
  addMemberRoleAction,
  removeMemberRoleAction,
  createNonHmifMemberAction,
  resetNonHmifPasswordAction,
} from "@/lib/actions/proker";
import { Plus, Trash2, KeyRound, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface DivisionItem {
  id: string;
  name: string;
  kind: "sekretaris" | "bendahara" | "custom";
  description: string | null;
  sort_order: number;
}

interface MemberRoleItem {
  id: string;
  user_id: string;
  role: "sc" | "pic" | "ketupel" | "sekretaris" | "bendahara" | "koor" | "staff";
  division_id: string | null;
  label: string | null;
  full_name: string;
  username: string;
  global_role: "admin" | "bph" | "member" | "external";
  angkatan: number | null;
}

interface AvailableUser {
  id: string;
  full_name: string;
  username: string;
  angkatan: number | null;
  global_role: string;
}

export function TimManager({
  prokerId,
  divisions,
  memberRoles,
  availableUsers,
  isManager,
}: {
  prokerId: string;
  divisions: DivisionItem[];
  memberRoles: MemberRoleItem[];
  availableUsers: AvailableUser[];
  isManager: boolean;
}) {
  // Modal States
  const [showAddDiv, setShowAddDiv] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showCreateNonHmif, setShowCreateNonHmif] = useState(false);

  // Group roles by managers vs divisions
  const managers = memberRoles.filter((r) => ["sc", "pic", "ketupel"].includes(r.role));

  const roleLabels: Record<string, string> = {
    sc: "SC",
    pic: "PIC",
    ketupel: "Ketua Pelaksana",
    sekretaris: "Sekretaris",
    bendahara: "Bendahara",
    koor: "Koordinator",
    staff: "Staff",
  };

  // 1. Tambah Divisi
  async function handleAddDivision(formData: FormData) {
    const res = await createDivisionAction(formData);
    if (res.ok) {
      toast.success("Divisi berhasil ditambahkan");
      setShowAddDiv(false);
    } else {
      toast.error(res.error || "Gagal membuat divisi");
    }
  }

  // 2. Hapus Divisi
  async function handleDeleteDivision(div: DivisionItem) {
    if (!confirm(`Hapus divisi "${div.name}" beserta peran di dalamnya?`)) return;
    const res = await deleteDivisionAction(div.id, prokerId);
    if (res.ok) toast.success("Divisi berhasil dihapus");
    else toast.error(res.error || "Gagal menghapus divisi");
  }

  // 3. Tambah Anggota
  async function handleAddMember(formData: FormData) {
    const res = await addMemberRoleAction(formData);
    if (res.ok) {
      toast.success("Anggota berhasil ditambahkan");
      setShowAddMember(false);
    } else {
      toast.error(res.error || "Gagal menambahkan anggota");
    }
  }

  // 4. Hapus Peran Anggota
  async function handleRemoveRole(roleId: string, memberName: string) {
    if (!confirm(`Hapus peran ${memberName} dari posisi ini?`)) return;
    const res = await removeMemberRoleAction(roleId, prokerId);
    if (res.ok) toast.success("Peran berhasil dihapus");
    else toast.error(res.error || "Gagal menghapus peran");
  }

  // 5. Buat Akun Non-HMIF
  async function handleCreateNonHmif(formData: FormData) {
    const res = await createNonHmifMemberAction(formData);
    if (res.ok) {
      toast.success("Akun non-HMIF berhasil dibuat & dimasukkan ke proker");
      setShowCreateNonHmif(false);
    } else {
      toast.error(res.error || "Gagal membuat akun non-HMIF");
    }
  }

  // 6. Reset Password Non-HMIF
  async function handleResetNonHmif(userId: string, name: string) {
    if (!confirm(`Reset password ${name} ke NIM / nomor identitas awalnya?`)) return;
    const res = await resetNonHmifPasswordAction(userId, prokerId);
    if (res.ok) toast.success(`Password ${name} direset ke NIM`);
    else toast.error(res.error || "Gagal mereset password");
  }

  return (
    <div className="space-y-8">
      {/* Action Header */}
      {isManager && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-surface rounded-lg border border-line">
          <div>
            <h2 className="text-sm font-semibold text-ink">Manajemen Kepanitiaan</h2>
            <p className="text-xs text-ink-3">Atur divisi, undang panitia HMIF atau panitia eksternal (non-HMIF).</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAddDiv(true)}
              className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold rounded-md border border-line-strong hover:bg-bg transition-colors text-ink"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah Divisi
            </button>
            <button
              onClick={() => setShowAddMember(true)}
              className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold rounded-md bg-accent text-on-accent hover:bg-accent-hover transition-colors"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Tambah Anggota
            </button>
          </div>
        </div>
      )}

      {/* 1. BAGIAN MANAJER PROKER (SC / PIC / KETUPEL) */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-2">
            Manajer Proker (SC / PIC / Ketupel)
          </h2>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {managers.map((r) => (
            <div
              key={r.id}
              className="border border-line rounded-lg p-3 bg-bg flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm text-ink">{r.full_name}</span>
                  {r.global_role === "external" && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-medium">
                      Non-HMIF
                    </span>
                  )}
                </div>
                <div className="text-xs text-ink-3 mt-0.5">
                  <span className="font-medium text-ink-2">{roleLabels[r.role]}</span>
                  {r.label && ` • ${r.label}`}
                </div>
              </div>

              {isManager && (
                <div className="flex items-center gap-1">
                  {r.global_role === "external" && (
                    <button
                      onClick={() => handleResetNonHmif(r.user_id, r.full_name)}
                      title="Reset Password ke NIM"
                      className="p-1.5 text-ink-3 hover:text-ink rounded hover:bg-surface"
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleRemoveRole(r.id, r.full_name)}
                    title="Hapus peran"
                    className="p-1.5 text-danger/80 hover:text-danger rounded hover:bg-danger-soft"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 2. BAGIAN DIVISI & ANGGOTA PER DIVISI */}
      <section className="space-y-4">
        <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-2">
          Daftar Divisi & Anggota
        </h2>

        {divisions.map((div) => {
          const divMembers = memberRoles.filter((r) => r.division_id === div.id);

          return (
            <div key={div.id} className="border border-line rounded-lg bg-bg overflow-hidden">
              {/* Header Divisi */}
              <div className="flex items-center justify-between p-3.5 bg-surface border-b border-line">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-ink">{div.name}</h3>
                    {div.kind !== "custom" && (
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-bg border border-line text-ink-3">
                        Bawaan
                      </span>
                    )}
                  </div>
                  {div.description && (
                    <p className="text-xs text-ink-2 mt-0.5">{div.description}</p>
                  )}
                </div>

                {isManager && div.kind === "custom" && (
                  <button
                    onClick={() => handleDeleteDivision(div)}
                    className="p-1.5 text-danger/70 hover:text-danger rounded hover:bg-danger-soft text-xs inline-flex items-center gap-1"
                    title="Hapus Divisi"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Hapus Divisi</span>
                  </button>
                )}
              </div>

              {/* Anggota di Divisi ini */}
              <div className="p-3">
                {divMembers.length === 0 ? (
                  <p className="text-xs text-ink-3 italic py-2">Belum ada anggota di divisi ini.</p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {divMembers.map((m) => (
                      <div
                        key={m.id}
                        className="p-2.5 rounded border border-line bg-bg flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-medium text-ink flex items-center gap-1.5">
                            {m.full_name}
                            {m.global_role === "external" && (
                              <span className="text-[9px] px-1 rounded bg-amber-100 text-amber-800">
                                Eksternal
                              </span>
                            )}
                          </div>
                          <div className="text-ink-3 mt-0.5">
                            <span className="font-semibold text-ink-2">{roleLabels[m.role]}</span>
                            {m.label && ` (${m.label})`}
                          </div>
                        </div>

                        {isManager && (
                          <div className="flex items-center gap-1">
                            {m.global_role === "external" && (
                              <button
                                onClick={() => handleResetNonHmif(m.user_id, m.full_name)}
                                title="Reset Password"
                                className="p-1 text-ink-3 hover:text-ink rounded"
                              >
                                <KeyRound className="h-3 w-3" />
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoveRole(m.id, m.full_name)}
                              title="Hapus peran"
                              className="p-1 text-danger/80 hover:text-danger rounded hover:bg-danger-soft"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* DIALOG: TAMBAH DIVISI */}
      {showAddDiv && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-bg border border-line rounded-lg w-full max-w-md p-5 space-y-4">
            <h3 className="font-semibold text-base text-ink">Tambah Divisi Baru</h3>
            <form action={handleAddDivision} className="space-y-3">
              <input type="hidden" name="prokerId" value={prokerId} />
              <div>
                <label className="block text-xs font-medium text-ink mb-1">
                  Nama Divisi <span className="text-danger">*</span>
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Contoh: Acara, Humas, Publikasi"
                  className="w-full h-10 px-3 text-sm rounded-md border border-line bg-bg focus-visible:outline-none focus-visible:border-ink"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink mb-1">Deskripsi Singkat</label>
                <input
                  name="description"
                  type="text"
                  placeholder="Fokus dan ruang lingkup divisi"
                  className="w-full h-10 px-3 text-sm rounded-md border border-line bg-bg focus-visible:outline-none focus-visible:border-ink"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDiv(false)}
                  className="h-9 px-3 text-xs border border-line rounded-md hover:bg-surface text-ink-2"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 text-xs font-semibold bg-accent text-on-accent rounded-md hover:bg-accent-hover"
                >
                  Simpan Divisi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIALOG: TAMBAH ANGGOTA HMIF */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-bg border border-line rounded-lg w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base text-ink">Tambah Anggota Panitia</h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddMember(false);
                  setShowCreateNonHmif(true);
                }}
                className="text-xs text-accent hover:underline font-semibold"
              >
                + Akun Non-HMIF?
              </button>
            </div>

            <form action={handleAddMember} className="space-y-3">
              <input type="hidden" name="prokerId" value={prokerId} />

              <div>
                <label className="block text-xs font-medium text-ink mb-1">
                  Pilih Anggota <span className="text-danger">*</span>
                </label>
                <select
                  name="userId"
                  required
                  className="w-full h-10 px-3 text-sm rounded-md border border-line bg-bg text-ink focus-visible:outline-none focus-visible:border-ink"
                >
                  <option value="">Cari anggota HMIF...</option>
                  {availableUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.username}) {u.angkatan ? `• ${u.angkatan}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">
                    Role <span className="text-danger">*</span>
                  </label>
                  <select
                    name="role"
                    required
                    className="w-full h-10 px-2 text-sm rounded-md border border-line bg-bg text-ink focus-visible:outline-none focus-visible:border-ink"
                  >
                    <option value="koor">Koor Divisi</option>
                    <option value="staff">Staff Divisi</option>
                    <option value="sekretaris">Sekretaris</option>
                    <option value="bendahara">Bendahara</option>
                    <option value="ketupel">Ketua Pelaksana</option>
                    <option value="pic">PIC</option>
                    <option value="sc">SC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink mb-1">
                    Divisi
                  </label>
                  <select
                    name="divisionId"
                    className="w-full h-10 px-2 text-sm rounded-md border border-line bg-bg text-ink focus-visible:outline-none focus-visible:border-ink"
                  >
                    <option value="">Tanpa Divisi (Manajer)</option>
                    {divisions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink mb-1">
                  Label Posisi (Opsional)
                </label>
                <input
                  name="label"
                  type="text"
                  placeholder="Contoh: Sekretaris 1, Bendahara 2, dsb."
                  className="w-full h-10 px-3 text-sm rounded-md border border-line bg-bg focus-visible:outline-none focus-visible:border-ink"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="h-9 px-3 text-xs border border-line rounded-md hover:bg-surface text-ink-2"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 text-xs font-semibold bg-accent text-on-accent rounded-md hover:bg-accent-hover"
                >
                  Tambahkan ke Tim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIALOG: BUAT AKUN NON-HMIF */}
      {showCreateNonHmif && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-bg border border-line rounded-lg w-full max-w-md p-5 space-y-4">
            <div>
              <h3 className="font-semibold text-base text-ink">Buat Akun Panitia Non-HMIF</h3>
              <p className="text-xs text-ink-3 mt-0.5">
                Akun panitia eksternal akan otomatis dibuat dan dimasukkan ke proker ini.
              </p>
            </div>

            <form action={handleCreateNonHmif} className="space-y-3">
              <input type="hidden" name="prokerId" value={prokerId} />

              <div>
                <label className="block text-xs font-medium text-ink mb-1">
                  Nama Lengkap <span className="text-danger">*</span>
                </label>
                <input
                  name="fullName"
                  type="text"
                  required
                  placeholder="Nama lengkap panitia non-HMIF"
                  className="w-full h-10 px-3 text-sm rounded-md border border-line bg-bg focus-visible:outline-none focus-visible:border-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">
                    NIM / Identitas <span className="text-danger">*</span>
                  </label>
                  <input
                    name="nim"
                    type="text"
                    required
                    placeholder="Password awal"
                    className="w-full h-10 px-3 text-sm rounded-md border border-line bg-bg focus-visible:outline-none focus-visible:border-ink"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">
                    Angkatan <span className="text-danger">*</span>
                  </label>
                  <input
                    name="angkatan"
                    type="number"
                    required
                    min={2000}
                    max={2100}
                    defaultValue={2024}
                    className="w-full h-10 px-3 text-sm rounded-md border border-line bg-bg focus-visible:outline-none focus-visible:border-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">
                    Role <span className="text-danger">*</span>
                  </label>
                  <select
                    name="role"
                    required
                    className="w-full h-10 px-2 text-sm rounded-md border border-line bg-bg text-ink focus-visible:outline-none focus-visible:border-ink"
                  >
                    <option value="staff">Staff Divisi</option>
                    <option value="koor">Koor Divisi</option>
                    <option value="sekretaris">Sekretaris</option>
                    <option value="bendahara">Bendahara</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Divisi</label>
                  <select
                    name="divisionId"
                    className="w-full h-10 px-2 text-sm rounded-md border border-line bg-bg text-ink focus-visible:outline-none focus-visible:border-ink"
                  >
                    {divisions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink mb-1">Label Posisi</label>
                <input
                  name="label"
                  type="text"
                  placeholder="Contoh: Desainer, LO, dsb."
                  className="w-full h-10 px-3 text-sm rounded-md border border-line bg-bg focus-visible:outline-none focus-visible:border-ink"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateNonHmif(false)}
                  className="h-9 px-3 text-xs border border-line rounded-md hover:bg-surface text-ink-2"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 text-xs font-semibold bg-accent text-on-accent rounded-md hover:bg-accent-hover"
                >
                  Buat Akun & Masukkan Tim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
