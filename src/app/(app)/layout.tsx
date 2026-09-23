import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { BottomNav } from '@/components/BottomNav';
import { CurrentUserProvider } from '@/components/CurrentUserContext';

export default async function AppLayout({ children }: LayoutProps<'/'>) {
  const userId = await getSession();
  if (!userId) redirect('/login');

  return (
    <CurrentUserProvider userId={userId}>
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-1 flex-col">
        <div className="flex-1 pb-24">{children}</div>
      </div>
      <BottomNav />
    </CurrentUserProvider>
  );
}
