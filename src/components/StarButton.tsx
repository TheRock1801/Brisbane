'use client';

import { useOptimistic, useTransition } from 'react';
import { Star } from 'lucide-react';
import { toggleStar } from '@/lib/actions/stars';
import { useCurrentUser } from '@/components/CurrentUserContext';
import type { UserId } from '@/lib/types';
import { cn } from '@/lib/cn';

export function StarButton({
  ideaId,
  stars,
  size = 20,
  showCount = false,
}: {
  ideaId: string;
  stars: UserId[];
  size?: number;
  showCount?: boolean;
}) {
  const me = useCurrentUser();
  const [, startTransition] = useTransition();
  const [optimisticStars, applyOptimistic] = useOptimistic(stars, (current, next: UserId[]) => next);

  const isStarred = optimisticStars.includes(me);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = isStarred ? optimisticStars.filter((id) => id !== me) : [...optimisticStars, me];
    startTransition(async () => {
      applyOptimistic(next);
      await toggleStar(ideaId);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center gap-1 rounded-full bg-white/90 p-1.5 shadow-sm active:scale-95"
      aria-pressed={isStarred}
      aria-label={isStarred ? 'Unstar' : 'Star'}
    >
      <Star
        size={size}
        strokeWidth={2}
        className={cn(isStarred ? 'fill-accent text-accent' : 'text-muted')}
      />
      {showCount && optimisticStars.length > 0 && (
        <span className="pr-0.5 text-xs font-semibold text-foreground">
          {optimisticStars.length}
        </span>
      )}
    </button>
  );
}
