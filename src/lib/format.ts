import { format, formatDistanceToNow, differenceInDays } from "date-fns";
import { id } from "date-fns/locale";

const WIB_TIMEZONE = "Asia/Jakarta";

/**
 * Format tanggal ke format Indonesia: "24 Okt 2026"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "d MMM yyyy", { locale: id });
}

/**
 * Format jam ke format Indonesia: "14.30 WIB"
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const timeStr = d.toLocaleTimeString("id-ID", {
    timeZone: WIB_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${timeStr.replace(":", ".")} WIB`;
}

/**
 * Format tanggal + jam: "24 Okt 2026, 14.30 WIB"
 */
export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)}, ${formatTime(date)}`;
}

/**
 * Format jarak waktu relatif: "3 hari lagi", "2 hari yang lalu"
 */
export function formatRelative(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: id });
}

/**
 * Format Rupiah: "Rp 1.500.000"
 */
export function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

/**
 * Hitung hari sampai deadline (negatif = terlambat)
 */
export function daysUntilDeadline(deadline: Date | string): number {
  const d = typeof deadline === "string" ? new Date(deadline) : deadline;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return differenceInDays(d, today);
}

/**
 * Cek apakah deadline sudah lewat
 */
export function isOverdue(deadline: Date | string, status?: string): boolean {
  if (status === "selesai") return false;
  const days = daysUntilDeadline(deadline);
  return days < 0;
}

/**
 * Cek apakah deadline segera (≤3 hari)
 */
export function isUrgent(deadline: Date | string, status?: string): boolean {
  if (status === "selesai") return false;
  const days = daysUntilDeadline(deadline);
  return days >= 0 && days <= 3;
}

/**
 * Label deadline yang ramah
 */
export function deadlineLabel(deadline: Date | string, status?: string): string {
  if (status === "selesai") return formatDate(deadline);
  const days = daysUntilDeadline(deadline);
  if (days < 0) return `Terlambat ${Math.abs(days)} hari`;
  if (days === 0) return "Hari ini";
  if (days === 1) return "Besok";
  if (days <= 3) return `${days} hari lagi`;
  return formatDate(deadline);
}
