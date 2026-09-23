'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/browser';

/**
 * Mount on any page whose data can change from the other person's phone.
 * Not full live-editing — just "someone touched the data, re-fetch this
 * server-rendered page" per the brief's "basic realtime subscriptions are enough".
 */
export function RealtimeRefresher({ tables }: { tables: string[] }) {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const client = supabaseBrowser();
    if (!client) return;

    const scheduleRefresh = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => router.refresh(), 400);
    };

    const channel = client.channel(`realtime:${tables.join(',')}`);
    for (const table of tables) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, scheduleRefresh);
    }
    channel.subscribe();

    return () => {
      if (timer.current) clearTimeout(timer.current);
      client.removeChannel(channel);
    };
  }, [tables, router]);

  return null;
}
