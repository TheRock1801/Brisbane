'use client';

import Image from 'next/image';
import { ImageOff, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import type { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core';
import { StatusBadge } from '@/components/StatusBadge';
import { CategoryTag } from '@/components/CategoryTag';
import type { ItineraryItemWithIdea } from '@/lib/data/itinerary';

export function ItineraryRow({
  item,
  onEdit,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  dragHandleRef,
  dragHandleAttributes,
  dragHandleListeners,
  style,
  setNodeRef,
}: {
  item: ItineraryItemWithIdea;
  onEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  dragHandleRef?: (node: HTMLElement | null) => void;
  dragHandleAttributes?: DraggableAttributes;
  dragHandleListeners?: DraggableSyntheticListeners;
  style?: React.CSSProperties;
  setNodeRef?: (node: HTMLElement | null) => void;
}) {
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface p-2.5"
    >
      <button
        ref={dragHandleRef}
        {...dragHandleAttributes}
        {...dragHandleListeners}
        type="button"
        className="shrink-0 touch-none px-0.5 text-muted"
        aria-label="Drag to reorder"
      >
        <GripVertical size={18} />
      </button>

      <button type="button" onClick={onEdit} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#f2ede4]">
          {item.idea.image_url ? (
            <Image src={item.idea.image_url} alt="" fill unoptimized className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted">
              <ImageOff size={16} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold leading-tight">{item.idea.name}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
            {item.start_time && (
              <span className="text-xs font-medium text-foreground">
                {item.start_time.slice(0, 5)}
                {item.end_time ? `–${item.end_time.slice(0, 5)}` : ''}
              </span>
            )}
            <CategoryTag category={item.idea.category} />
          </div>
          <div className="mt-1">
            <StatusBadge status={item.status} />
          </div>
        </div>
      </button>

      <div className="flex shrink-0 flex-col">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={!canMoveUp}
          className="p-1 text-muted disabled:opacity-25"
          aria-label="Move up"
        >
          <ChevronUp size={16} />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={!canMoveDown}
          className="p-1 text-muted disabled:opacity-25"
          aria-label="Move down"
        >
          <ChevronDown size={16} />
        </button>
      </div>
    </div>
  );
}
