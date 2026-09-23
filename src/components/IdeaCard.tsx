import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, ImageOff } from 'lucide-react';
import type { IdeaWithState } from '@/lib/types';
import { CategoryTag } from '@/components/CategoryTag';
import { StarButton } from '@/components/StarButton';
import { Avatar } from '@/components/Avatar';

export function IdeaCard({ idea }: { idea: IdeaWithState }) {
  return (
    <Link
      href={`/idea/${idea.id}`}
      className="block overflow-hidden rounded-3xl border border-border-subtle bg-surface shadow-[0_1px_10px_-4px_rgba(0,0,0,0.1)] transition active:scale-[0.98]"
    >
      <div className="relative aspect-[4/3] w-full bg-[#f2ede4]">
        {idea.image_url ? (
          <Image
            src={idea.image_url}
            alt={idea.name}
            fill
            sizes="(max-width: 640px) 100vw, 400px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            <ImageOff size={28} strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute right-2.5 top-2.5">
          <StarButton ideaId={idea.id} stars={idea.stars} />
        </div>
        <div className="absolute bottom-2.5 left-2.5">
          <Avatar userId={idea.created_by} size={24} />
        </div>
      </div>

      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-semibold leading-tight">{idea.name}</h3>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <CategoryTag category={idea.category} />
          {idea.suburb && <span className="text-xs text-muted">· {idea.suburb}</span>}
        </div>
        {idea.description && (
          <p className="mt-1.5 line-clamp-2 text-sm text-muted">{idea.description}</p>
        )}
        {idea.comment_count > 0 && (
          <div className="mt-2 flex items-center gap-1 text-xs text-muted">
            <MessageCircle size={13} />
            {idea.comment_count}
          </div>
        )}
      </div>
    </Link>
  );
}
