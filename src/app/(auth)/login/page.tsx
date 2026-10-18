"use client";

import { loginAction } from "@/lib/actions/auth";
import { useActionState } from "react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const result = await loginAction(formData);
      if (!result.ok) return { error: result.error };
      return null;
    },
    null
  );

  return (
    <div className="bg-bg border border-line rounded-lg p-6">
      <h2 className="text-lg font-semibold text-ink mb-4">Masuk</h2>

      {state?.error && (
        <div className="mb-4 p-3 bg-danger-soft border border-danger/20 rounded-md text-sm text-danger" role="alert">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
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
            disabled={isPending}
            className="flex h-11 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus-visible:outline-none focus-visible:border-ink focus-visible:ring-1 focus-visible:ring-ink disabled:opacity-50"
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
            disabled={isPending}
            className="flex h-11 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus-visible:outline-none focus-visible:border-ink focus-visible:ring-1 focus-visible:ring-ink disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full h-11 bg-accent text-on-accent font-semibold rounded-md hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {isPending ? "Memproses…" : "Masuk"}
        </button>
      </form>
      <p className="mt-4 text-xs text-ink-3 text-center">
        Lupa password? Hubungi Admin untuk reset.
      </p>
    </div>
  );
}
