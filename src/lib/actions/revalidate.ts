import 'server-only';
import { revalidatePath } from 'next/cache';

/** Every mutation touches data shown on Home's snapshot, so always include '/'. */
export function revalidateTripViews(extra: string[] = []) {
  revalidatePath('/');
  revalidatePath('/planning');
  revalidatePath('/actual');
  revalidatePath('/map');
  for (const path of extra) revalidatePath(path);
}
