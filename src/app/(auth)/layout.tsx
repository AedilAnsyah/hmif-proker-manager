export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-mono font-bold text-2xl text-ink">HMIF</h1>
          <p className="text-sm text-ink-2 mt-1">Proker Manager</p>
        </div>
        {children}
      </div>
    </div>
  );
}
