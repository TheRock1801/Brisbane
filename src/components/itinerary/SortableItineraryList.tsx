'use client';

import { useState } from 'react';
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ItineraryRow } from '@/components/itinerary/ItineraryRow';
import { ItineraryItemSheet } from '@/components/itinerary/ItineraryItemSheet';
import { reorderDay } from '@/lib/actions/itinerary';
import type { ItineraryItemWithIdea } from '@/lib/data/itinerary';
import type { Day } from '@/lib/types';

function SortableItem({
  item,
  onEdit,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  item: ItineraryItemWithIdea;
  onEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <ItineraryRow
      item={item}
      onEdit={onEdit}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      canMoveUp={canMoveUp}
      canMoveDown={canMoveDown}
      setNodeRef={setNodeRef}
      style={style}
      dragHandleAttributes={attributes}
      dragHandleListeners={listeners}
    />
  );
}

export function SortableItineraryList({
  items,
  day,
  emptyLabel,
}: {
  items: ItineraryItemWithIdea[];
  day: Day;
  emptyLabel: string;
}) {
  const [prevItems, setPrevItems] = useState(items);
  const [ordered, setOrdered] = useState(items);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Re-sync local order when the server gives us a fresh `items` prop
  // (new day, or a realtime/action refresh) — see React's "adjusting state
  // when a prop changes" pattern, deliberately not an effect.
  if (items !== prevItems) {
    setPrevItems(items);
    setOrdered(items);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );

  function persist(next: ItineraryItemWithIdea[]) {
    setOrdered(next);
    void reorderDay(day, next.map((i) => i.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ordered.findIndex((i) => i.id === active.id);
    const newIndex = ordered.findIndex((i) => i.id === over.id);
    persist(arrayMove(ordered, oldIndex, newIndex));
  }

  function move(index: number, delta: number) {
    const newIndex = index + delta;
    if (newIndex < 0 || newIndex >= ordered.length) return;
    persist(arrayMove(ordered, index, newIndex));
  }

  const editingItem = ordered.find((i) => i.id === editingId) ?? null;

  if (ordered.length === 0) {
    return <p className="px-1 text-sm text-muted">{emptyLabel}</p>;
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ordered.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {ordered.map((item, index) => (
              <SortableItem
                key={item.id}
                item={item}
                onEdit={() => setEditingId(item.id)}
                onMoveUp={() => move(index, -1)}
                onMoveDown={() => move(index, 1)}
                canMoveUp={index > 0}
                canMoveDown={index < ordered.length - 1}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {editingItem && (
        <ItineraryItemSheet
          key={editingItem.id}
          open
          onClose={() => setEditingId(null)}
          item={editingItem}
        />
      )}
    </>
  );
}
