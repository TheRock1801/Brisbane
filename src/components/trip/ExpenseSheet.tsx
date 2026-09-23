'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Sheet } from '@/components/Sheet';
import { createExpense, deleteExpense, updateExpense } from '@/lib/actions/expenses';
import { formLabel, formInput, formRow, formButtonPrimary } from '@/lib/form-styles';
import { EXPENSE_CATEGORIES, SPLIT_TYPES, EXPENSE_STATUSES, type Expense, type ExpenseCategory, type SplitType, type ExpenseStatus } from '@/lib/types';

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  flights: 'Flights',
  accommodation: 'Accommodation',
  food: 'Food',
  drinks: 'Drinks',
  activities: 'Activities',
  transport: 'Transport',
  shopping: 'Shopping',
  other: 'Other',
};

const SPLIT_LABELS: Record<SplitType, string> = {
  equal: 'Shared equally',
  rocky_only: "Rocky only",
  vince_only: "Vince only",
};

export function ExpenseSheet({
  open,
  onClose,
  tripId,
  expense,
}: {
  open: boolean;
  onClose: () => void;
  tripId: string;
  expense?: Expense;
}) {
  const router = useRouter();
  const isEdit = Boolean(expense);
  const [name, setName] = useState(expense?.name ?? '');
  const [category, setCategory] = useState<ExpenseCategory>(expense?.category ?? 'other');
  const [amount, setAmount] = useState(expense ? String(expense.amount) : '');
  const [paidBy, setPaidBy] = useState<'rocky' | 'vince'>(expense?.paid_by ?? 'rocky');
  const [splitType, setSplitType] = useState<SplitType>(expense?.split_type ?? 'equal');
  const [status, setStatus] = useState<ExpenseStatus>(expense?.status ?? 'actual');
  const [note, setNote] = useState(expense?.note ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountNumber = Number(amount);
    if (!name.trim() || !Number.isFinite(amountNumber) || amountNumber <= 0) {
      setError('Enter a name and a valid amount.');
      return;
    }
    setError(null);
    startSaving(async () => {
      try {
        const payload = {
          name: name.trim(),
          category,
          amount: amountNumber,
          paid_by: paidBy,
          split_type: splitType,
          status,
          note: note.trim() || null,
        };
        if (isEdit && expense) {
          await updateExpense(expense.id, payload);
        } else {
          await createExpense({ ...payload, trip_id: tripId });
        }
        onClose();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      }
    });
  }

  function handleDelete() {
    if (!expense) return;
    if (!confirm('Delete this expense?')) return;
    startSaving(async () => {
      await deleteExpense(expense.id);
      onClose();
      router.refresh();
    });
  }

  return (
    <Sheet open={open} onClose={onClose} title={isEdit ? 'Edit expense' : 'Add expense'}>
      <form onSubmit={handleSubmit}>
        <div className={formRow}>
          <label className={formLabel} htmlFor="exp-name">
            Name
          </label>
          <input id="exp-name" required value={name} onChange={(e) => setName(e.target.value)} className={formInput} />
        </div>

        <div className={`${formRow} grid grid-cols-2 gap-3`}>
          <div>
            <label className={formLabel} htmlFor="exp-amount">
              Amount ($)
            </label>
            <input
              id="exp-amount"
              type="number"
              step="0.01"
              min="0"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={formInput}
            />
          </div>
          <div>
            <label className={formLabel} htmlFor="exp-category">
              Category
            </label>
            <select id="exp-category" value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)} className={formInput}>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={`${formRow} grid grid-cols-2 gap-3`}>
          <div>
            <label className={formLabel} htmlFor="exp-paidby">
              Paid by
            </label>
            <select id="exp-paidby" value={paidBy} onChange={(e) => setPaidBy(e.target.value as 'rocky' | 'vince')} className={formInput}>
              <option value="rocky">Rocky</option>
              <option value="vince">Vince</option>
            </select>
          </div>
          <div>
            <label className={formLabel} htmlFor="exp-status">
              Status
            </label>
            <select id="exp-status" value={status} onChange={(e) => setStatus(e.target.value as ExpenseStatus)} className={formInput}>
              {EXPENSE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === 'estimated' ? 'Estimated' : 'Actual'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={formRow}>
          <label className={formLabel} htmlFor="exp-split">
            Split
          </label>
          <select id="exp-split" value={splitType} onChange={(e) => setSplitType(e.target.value as SplitType)} className={formInput}>
            {SPLIT_TYPES.map((s) => (
              <option key={s} value={s}>
                {SPLIT_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <div className={formRow}>
          <label className={formLabel} htmlFor="exp-note">
            Note
          </label>
          <textarea id="exp-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} className={formInput} />
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={isSaving} className={formButtonPrimary}>
          {isSaving ? 'Saving…' : 'Save'}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSaving}
            className="mt-3 w-full text-center text-sm font-medium text-red-600"
          >
            Delete expense
          </button>
        )}
      </form>
    </Sheet>
  );
}
