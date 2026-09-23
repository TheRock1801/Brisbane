import { getActiveTrip } from '@/lib/data/trip';
import { getExpenses } from '@/lib/data/expenses';
import { summarizeBudget } from '@/lib/budget';
import { TripSubHeader } from '@/components/TripSubHeader';
import { ExpensesList } from '@/components/trip/ExpensesList';
import { PROFILES } from '@/lib/profiles';

export default async function BudgetPage() {
  const trip = await getActiveTrip();
  const expenses = await getExpenses(trip.id);
  const summary = summarizeBudget(expenses);

  return (
    <div>
      <TripSubHeader title="Budget" />

      <div className="px-4">
        <div className="rounded-3xl bg-[#EEF2F7] p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Total trip spend</p>
          <p className="mt-1 text-3xl font-semibold">${summary.total.toFixed(2)}</p>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted">Estimated</p>
              <p className="font-semibold">${summary.estimated.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted">Actual</p>
              <p className="font-semibold">${summary.actual.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted">{PROFILES.rocky.display_name} paid</p>
              <p className="font-semibold">${summary.rockyPaid.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted">{PROFILES.vince.display_name} paid</p>
              <p className="font-semibold">${summary.vincePaid.toFixed(2)}</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-center text-sm font-semibold">
            {summary.balanceLabel}
          </div>
        </div>
      </div>

      <div className="px-4 pt-6 pb-2">
        <h2 className="text-sm font-semibold text-muted">All expenses</h2>
      </div>
      <ExpensesList tripId={trip.id} expenses={expenses} />
    </div>
  );
}
