export default function TugasPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-ink lg:text-[26px]">Tugas Saya</h1>
      <p className="mt-1 text-sm text-ink-2">Semua tugas Anda di seluruh proker, urut deadline.</p>
      <div className="mt-6 border border-line rounded-lg p-8 text-center">
        <h3 className="text-base font-semibold text-ink">Belum ada tugas</h3>
        <p className="mt-1 text-sm text-ink-2">Anda belum ditugaskan di proker mana pun.</p>
      </div>
    </div>
  );
}
