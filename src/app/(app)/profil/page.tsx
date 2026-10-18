export default function ProfilPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-ink lg:text-[26px]">Profil</h1>
      <p className="mt-1 text-sm text-ink-2">Pengaturan akun Anda.</p>
      <div className="mt-6 border border-line rounded-lg p-6 space-y-4">
        <div>
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-3">Nama</span>
          <p className="text-sm text-ink mt-0.5">—</p>
        </div>
        <div>
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-3">Angkatan</span>
          <p className="text-sm text-ink mt-0.5">—</p>
        </div>
        <div>
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-3">Tipe</span>
          <p className="text-sm text-ink mt-0.5">—</p>
        </div>
      </div>
    </div>
  );
}
