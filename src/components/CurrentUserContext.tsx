'use client';

import { createContext, useContext } from 'react';
import type { UserId } from '@/lib/types';

const CurrentUserContext = createContext<UserId | null>(null);

export function CurrentUserProvider({
  userId,
  children,
}: {
  userId: UserId;
  children: React.ReactNode;
}) {
  return <CurrentUserContext.Provider value={userId}>{children}</CurrentUserContext.Provider>;
}

export function useCurrentUser(): UserId {
  const value = useContext(CurrentUserContext);
  if (!value) throw new Error('useCurrentUser must be used within CurrentUserProvider');
  return value;
}
