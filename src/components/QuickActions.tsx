'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Lightbulb, CalendarDays, MapPin, Receipt } from 'lucide-react';
import { AddIdeaSheet } from '@/components/AddIdeaSheet';
import { ExpenseSheet } from '@/components/trip/ExpenseSheet';
import type { Day } from '@/lib/types';

export function QuickActions({ tripId, today }: { tripId: string; today: Day }) {
  const [addIdeaOpen, setAddIdeaOpen] = useState(false);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);

  const actions = [
    { label: 'Add idea', icon: Lightbulb, onClick: () => setAddIdeaOpen(true) },
    { label: "Today's plan", icon: CalendarDays, href: `/actual?day=${today}` },
    { label: 'Open map', icon: MapPin, href: '/map' },
    { label: 'Add expense', icon: Receipt, onClick: () => setAddExpenseOpen(true) },
  ];

  return (
    <>
      <div className="grid grid-cols-4 gap-2">
        {actions.map(({ label, icon: Icon, href, onClick }) =>
          href ? (
            <Link
              key={label}
              href={href}
              className="flex flex-col items-center gap-1.5 rounded-2xl border border-border-subtle bg-surface py-3.5 active:scale-95"
            >
              <Icon size={19} strokeWidth={1.8} />
              <span className="text-center text-[11px] font-medium leading-tight">{label}</span>
            </Link>
          ) : (
            <button
              key={label}
              onClick={onClick}
              className="flex flex-col items-center gap-1.5 rounded-2xl border border-border-subtle bg-surface py-3.5 active:scale-95"
            >
              <Icon size={19} strokeWidth={1.8} />
              <span className="text-center text-[11px] font-medium leading-tight">{label}</span>
            </button>
          )
        )}
      </div>

      <AddIdeaSheet open={addIdeaOpen} onClose={() => setAddIdeaOpen(false)} tripId={tripId} defaultDay={today} />
      <ExpenseSheet open={addExpenseOpen} onClose={() => setAddExpenseOpen(false)} tripId={tripId} />
    </>
  );
}
