/**
 * Normalisasi username dari nama lengkap.
 * Aturan: lowercase, trim, spasi tunggal.
 * Contoh: " Budi  Santoso " → "budi santoso"
 */
export function normalizeUsername(fullName: string): string {
  return fullName
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

/**
 * Validasi username sudah sesuai aturan normalisasi.
 */
export function isValidUsername(username: string): boolean {
  return username === normalizeUsername(username) && username.length > 0;
}

/**
 * Generate email internal untuk Supabase Auth.
 * Format: {nim}@hmif.local
 */
export function generateInternalEmail(nim: string): string {
  return `${nim}@hmif.local`;
}
