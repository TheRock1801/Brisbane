import type { Profile, UserId } from '@/lib/types';

/**
 * Static — matches the two fixed rows seeded into `profiles` (kept in the DB
 * only for the foreign key). Reading from here avoids an extra query on
 * every page for a table that never changes.
 */
export const PROFILES: Record<UserId, Profile> = {
  rocky: { id: 'rocky', display_name: 'Rocky', avatar_color: '#d9534f' },
  vince: { id: 'vince', display_name: 'Vince', avatar_color: '#167d89' },
};

export function otherUser(userId: UserId): UserId {
  return userId === 'rocky' ? 'vince' : 'rocky';
}

export function starLabel(stars: UserId[]): string {
  if (stars.length === 0) return '';
  return stars.map((id) => `⭐ ${PROFILES[id].display_name}`).join(' + ');
}
