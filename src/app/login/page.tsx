const ERROR_MESSAGES: Record<string, string> = {
  wrong_password: "That's not it — try again.",
  pick_user: 'Tap your name below.',
  not_configured: "The app isn't set up yet — TRIP_PASSWORD is missing on the server.",
};

export default async function LoginPage(props: PageProps<'/login'>) {
  const searchParams = await props.searchParams;
  const errorKey = typeof searchParams.error === 'string' ? searchParams.error : undefined;
  const next = typeof searchParams.next === 'string' ? searchParams.next : '/';
  const error = errorKey ? ERROR_MESSAGES[errorKey] ?? 'Something went wrong.' : undefined;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-sm font-medium tracking-wide text-accent uppercase">Labour Weekend</p>
          <h1 className="mt-1 text-4xl font-semibold tracking-tight">Brisbane</h1>
        </div>

        <form
          action="/api/auth/login"
          method="POST"
          className="rounded-3xl border border-border-subtle bg-surface p-6 shadow-[0_2px_24px_-8px_rgba(0,0,0,0.12)]"
        >
          <input type="hidden" name="next" value={next} />

          <label className="mb-2 block text-sm font-medium text-muted" htmlFor="password">
            Trip password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoFocus
            placeholder="••••••••"
            className="mb-4 w-full rounded-2xl border border-border-subtle bg-background px-4 py-3.5 text-base outline-none focus:border-accent"
          />

          {error && (
            <p className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <p className="mb-3 text-sm font-medium text-muted">Who&apos;s this?</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="submit"
              name="userId"
              value="rocky"
              className="rounded-2xl border-2 border-border-subtle px-4 py-3.5 text-base font-semibold transition active:scale-[0.98] active:border-rocky"
            >
              Rocky
            </button>
            <button
              type="submit"
              name="userId"
              value="vince"
              className="rounded-2xl border-2 border-border-subtle px-4 py-3.5 text-base font-semibold transition active:scale-[0.98] active:border-vince"
            >
              Vince
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
