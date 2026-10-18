export default function LoginPage() {
  return (
    <div className="bg-bg border border-line rounded-lg p-6">
      <h2 className="text-lg font-semibold text-ink mb-4">Masuk</h2>
      <form className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-ink mb-1.5">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            placeholder="Nama lengkap"
            className="flex h-11 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus-visible:outline-none focus-visible:border-ink focus-visible:ring-1 focus-visible:ring-ink"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink mb-1.5">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="flex h-11 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus-visible:outline-none focus-visible:border-ink focus-visible:ring-1 focus-visible:ring-ink"
          />
        </div>
        <button
          type="submit"
          className="w-full h-11 bg-accent text-on-accent font-semibold rounded-md hover:bg-accent-hover transition-colors"
        >
          Masuk
        </button>
      </form>
      <p className="mt-4 text-xs text-ink-3 text-center">
        Lupa password? Hubungi Admin untuk reset.
      </p>
    </div>
  );
}
