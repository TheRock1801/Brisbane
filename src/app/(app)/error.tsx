'use client';

export default function AppError({ error, reset }: { error: Error; reset: () => void }) {
  const notConfigured = error.message.includes('Supabase is not configured');

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="text-lg font-semibold">
        {notConfigured ? "Supabase isn't wired up yet" : 'Something went wrong'}
      </p>
      <p className="mt-2 max-w-xs text-sm text-muted">
        {notConfigured
          ? 'Add SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local, then run supabase/schema.sql and supabase/seed.sql in the Supabase SQL editor.'
          : error.message}
      </p>
      <button
        onClick={reset}
        className="mt-5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground"
      >
        Try again
      </button>
    </div>
  );
}
