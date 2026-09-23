'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ExpenseSheet } from '@/components/trip/ExpenseSheet';
import { PROFILES } from '@/lib/profiles';
import { formButtonPrimary } from '@/lib/form-styles';
import type { Expense } from '@/lib/types';

const CATEGORY_LABELS: Record<string, string> = {
  flights: 'Flights',
  accommodation: 'Accommodation',
  food: 'Food',
  drinks: 'Drinks',
  activities: 'Activities',
  transport: 'Transport',
  shopping: 'Shopping',
  other: 'Other',
};

function ExpenseRow({ expense, onEdit }: { expense: Expense; onEdit: () => void }) {
  return (
    <button
      onClick={onEdit}
      className="flex w-full items-center gap-3 rounded-2xl border border-border-subtle bg-surface p-3.5 text-left active:scale-[0.98]"
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
        style={{ backgroundColor: PROFILES[expense.paid_by].avatar_color }}
      >
        {PROFILES[expense.paid_by].display_name[0]}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold">{expense.name}</p>
        <p className="text-xs text-muted">
          {CATEGORY_LABELS[expense.category]} · {expense.status === 'estimated' ? 'Estimated' : 'Actual'}
        </p>
      </div>
      <span className="shrink-0 text-[15px] font-semibold">${expense.amount.toFixed(2)}</span>
    </button>
  );
}

export function ExpensesList({ tripId, expenses }: { tripId: string; expenses: Expense[] }) {
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  return (
    <div className="px-4 pb-4">
      <div className="space-y-2">
        {expenses.map((e) => (
          <ExpenseRow key={e.id} expense={e} onEdit={() => setEditing(e)} />
        ))}
      </div>

      {expenses.length === 0 && <p className="mt-4 text-center text-sm text-muted">No expenses yet.</p>}

      <button onClick={() => setAddOpen(true)} className={`${formButtonPrimary} mt-4 flex items-center justify-center gap-2`}>
        <Plus size={18} /> Add expense
      </button>

      <ExpenseSheet open={addOpen} onClose={() => setAddOpen(false)} tripId={tripId} />
      {editing && (
        <ExpenseSheet key={editing.id} open onClose={() => setEditing(null)} tripId={tripId} expense={editing} />
      )}
    </div>
  );
}
