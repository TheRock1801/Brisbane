import type { Expense } from '@/lib/types';
import { PROFILES } from '@/lib/profiles';

export interface BudgetSummary {
  total: number;
  estimated: number;
  actual: number;
  rockyPaid: number;
  vincePaid: number;
  /** positive => Vince owes Rocky; negative => Rocky owes Vince */
  balance: number;
  balanceLabel: string;
}

export function summarizeBudget(expenses: Expense[]): BudgetSummary {
  let total = 0;
  let estimated = 0;
  let actual = 0;
  let rockyPaid = 0;
  let vincePaid = 0;
  let balance = 0;

  for (const e of expenses) {
    total += e.amount;
    if (e.status === 'estimated') estimated += e.amount;
    else actual += e.amount;

    if (e.paid_by === 'rocky') rockyPaid += e.amount;
    else vincePaid += e.amount;

    // Only equally-split expenses create a debt between the two of you —
    // a "Rocky only"/"Vince only" expense is that person's own cost, full stop.
    if (e.split_type === 'equal') {
      const half = e.amount / 2;
      balance += e.paid_by === 'rocky' ? half : -half;
    }
  }

  const rounded = Math.round(Math.abs(balance) * 100) / 100;
  const balanceLabel =
    rounded < 0.01
      ? 'All settled up'
      : balance > 0
        ? `${PROFILES.vince.display_name} owes ${PROFILES.rocky.display_name} $${rounded.toFixed(2)}`
        : `${PROFILES.rocky.display_name} owes ${PROFILES.vince.display_name} $${rounded.toFixed(2)}`;

  return { total, estimated, actual, rockyPaid, vincePaid, balance, balanceLabel };
}
