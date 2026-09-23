import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, ImageOff, MapPin, ExternalLink } from 'lucide-react';
import { getActiveTrip } from '@/lib/data/trip';
import { getIdea } from '@/lib/data/ideas';
import { getComments } from '@/lib/data/comments';
import { CategoryTag } from '@/components/CategoryTag';
import { StarButton } from '@/components/StarButton';
import { StatusBadge } from '@/components/StatusBadge';
import { Avatar } from '@/components/Avatar';
import { EditIdeaButton } from '@/components/EditIdeaButton';
import { CommentsSection } from '@/components/CommentsSection';
import { StaticMapPreview } from '@/components/StaticMapPreview';
import { RealtimeRefresher } from '@/components/RealtimeRefresher';
import { PROFILES, starLabel } from '@/lib/profiles';
import { DAY_LABELS } from '@/lib/types';

export default async function IdeaDetailPage(props: PageProps<'/idea/[id]'>) {
  const { id } = await props.params;
  const [trip, idea, comments] = await Promise.all([
    getActiveTrip(),
    getIdea(id),
    getComments(id),
  ]);

  if (!idea) notFound();

  const item = idea.itinerary;

  return (
    <div>
      <RealtimeRefresher tables={['ideas', 'stars', 'comments', 'itinerary_items']} />

      <div className="relative aspect-[4/3] w-full bg-[#EEF2F7]">
        {idea.image_url ? (
          <Image
            src={idea.image_url}
            alt={idea.name}
            fill
            sizes="(max-width: 640px) 100vw, 512px"
            className="object-cover"
            unoptimized
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            <ImageOff size={36} strokeWidth={1.5} />
          </div>
        )}
        <Link
          href={`/planning?day=${idea.day}`}
          className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow"
          aria-label="Back to Planning"
        >
          <ChevronLeft size={20} />
        </Link>
        <div className="absolute right-3 top-3">
          <StarButton ideaId={idea.id} stars={idea.stars} size={20} />
        </div>
      </div>

      <div className="px-4 pb-8 pt-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold leading-tight">{idea.name}</h1>
          <EditIdeaButton tripId={trip.id} idea={idea} />
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <CategoryTag category={idea.category} />
          {idea.suburb && <span className="text-xs text-muted">· {idea.suburb}</span>}
        </div>

        {idea.stars.length > 0 && (
          <p className="mt-2 text-sm font-medium text-foreground">{starLabel(idea.stars)}</p>
        )}

        {item && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl bg-[#EEF2F7] px-3.5 py-3">
            <StatusBadge status={item.status} />
            <span className="text-sm text-muted">{DAY_LABELS[item.day]}</span>
            {item.start_time && (
              <span className="text-sm text-muted">
                · {item.start_time.slice(0, 5)}
                {item.end_time ? `–${item.end_time.slice(0, 5)}` : ''}
              </span>
            )}
            <Link href="/actual" className="ml-auto text-xs font-semibold text-accent">
              Manage in Actual
            </Link>
          </div>
        )}

        {idea.description && (
          <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed">{idea.description}</p>
        )}

        {idea.address && (
          <div className="mt-4 flex items-start gap-2 text-sm text-muted">
            <MapPin size={16} className="mt-0.5 shrink-0" />
            <span>{idea.address}</span>
          </div>
        )}

        {idea.latitude != null && idea.longitude != null && (
          <div className="mt-3">
            <StaticMapPreview latitude={idea.latitude} longitude={idea.longitude} />
          </div>
        )}

        {idea.source_url && (
          <a
            href={idea.source_url}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex items-center gap-1.5 text-sm font-medium text-accent"
          >
            <ExternalLink size={14} /> View source
          </a>
        )}

        <div className="mt-4 flex items-center gap-2 text-xs text-muted">
          <Avatar userId={idea.created_by} size={18} />
          Added by {PROFILES[idea.created_by].display_name}
        </div>

        <div className="mt-8 border-t border-border-subtle pt-6">
          <CommentsSection ideaId={idea.id} comments={comments} />
        </div>
      </div>
    </div>
  );
}
