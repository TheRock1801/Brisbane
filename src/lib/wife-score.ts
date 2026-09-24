import type { WifeCandidate } from '@/lib/types';

/** Average of whichever sub-scores are set, to one decimal — null if none are. */
export function wifeTotal(candidate: Pick<WifeCandidate, 'looks' | 'wife_material' | 'personality'>): number | null {
  const scores = [candidate.looks, candidate.wife_material, candidate.personality].filter(
    (n): n is number => n != null
  );
  if (scores.length === 0) return null;
  return Math.round((scores.reduce((sum, n) => sum + n, 0) / scores.length) * 10) / 10;
}
