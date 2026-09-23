import { PROFILES } from '@/lib/profiles';
import type { UserId } from '@/lib/types';
import { cn } from '@/lib/cn';

export function Avatar({ userId, size = 28 }: { userId: UserId; size?: number }) {
  const profile = PROFILES[userId];
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{
        backgroundColor: profile.avatar_color,
        width: size,
        height: size,
        fontSize: size * 0.42,
      }}
      title={profile.display_name}
    >
      {profile.display_name[0]}
    </span>
  );
}

export function AvatarStack({ userIds, size = 20 }: { userIds: UserId[]; size?: number }) {
  if (userIds.length === 0) return null;
  return (
    <div className={cn('flex items-center')} style={{ marginLeft: userIds.length > 1 ? 6 : 0 }}>
      {userIds.map((id, i) => (
        <span key={id} style={{ marginLeft: i === 0 ? 0 : -6 }}>
          <Avatar userId={id} size={size} />
        </span>
      ))}
    </div>
  );
}
