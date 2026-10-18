export default function GantiPasswordPage() {
  return (
    <div className="bg-bg border border-line rounded-lg p-6">
      <h2 className="text-lg font-semibold text-ink mb-2">Ganti Password</h2>
      <p className="text-sm text-ink-2 mb-4">
        Anda wajib mengganti password sebelum menggunakan aplikasi.
      </p>
      <form className="space-y-4">
        <div>
          <label htmlFor="new-password" className="block text-sm font-medium text-ink mb-1.5">
            Password baru
          </label>
          <input
            id="new-password"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="flex h-11 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus-visible:outline-none focus-visible:border-ink focus-visible:ring-1 focus-visible:ring-ink"
          />
          <p className="mt-1 text-xs text-ink-3">Minimal 8 karakter, tidak boleh sama dengan NIM.</p>
        </div>
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-ink mb-1.5">
            Konfirmasi password baru
          </label>
          <input
            id="confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            className="flex h-11 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus-visible:outline-none focus-visible:border-ink focus-visible:ring-1 focus-visible:ring-ink"
          />
        </div>
        <button
          type="submit"
          className="w-full h-11 bg-accent text-on-accent font-semibold rounded-md hover:bg-accent-hover transition-colors"
        >
          Simpan
        </button>
      </form>
    </div>
  );
}
