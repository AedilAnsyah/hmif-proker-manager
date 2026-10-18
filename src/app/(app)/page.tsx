export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-ink lg:text-[26px]">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-2">
        Selamat datang di HMIF Proker Manager.
      </p>

      {/* Segera section */}
      <section className="mt-6">
        <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-2 mb-3">
          Segera
        </h2>
        <div className="border border-line rounded-lg p-8 text-center">
          <p className="text-sm text-ink-2">Belum ada tugas mendesak.</p>
        </div>
      </section>

      {/* Proker Saya section */}
      <section className="mt-8">
        <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-2 mb-3">
          Proker Saya
        </h2>
        <div className="border border-line rounded-lg p-8 text-center">
          <h3 className="text-base font-semibold text-ink">Belum ada proker</h3>
          <p className="mt-1 text-sm text-ink-2">
            Anda belum terdaftar di proker mana pun.
          </p>
        </div>
      </section>
    </div>
  );
}
