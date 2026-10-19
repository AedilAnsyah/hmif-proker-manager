import { Bell } from "lucide-react";

export const metadata = {
  title: "Notifikasi",
};

export default function NotifikasiPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-ink lg:text-[26px]">Notifikasi</h1>
      <p className="mt-1 text-sm text-ink-2">Pemberitahuan tugas, deadline, dan agenda Anda.</p>

      <div className="mt-8 border border-line rounded-lg p-12 text-center flex flex-col items-center justify-center">
        <div className="h-12 w-12 rounded-full bg-surface border border-line flex items-center justify-center text-ink-3 mb-3">
          <Bell className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-ink">Belum ada notifikasi</h3>
        <p className="mt-1 text-sm text-ink-2 max-w-sm">
          Semua pembaruan kegiatan dan deadline proker akan ditampilkan di sini.
        </p>
      </div>
    </div>
  );
}
