import {
  UtensilsCrossed,
  Wine,
  Coffee,
  Ticket,
  ShoppingBag,
  Camera,
  Moon,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import type { Category } from '@/lib/types';

const CATEGORY_META: Record<Category, { label: string; icon: LucideIcon }> = {
  food: { label: 'Food', icon: UtensilsCrossed },
  drinks: { label: 'Drinks', icon: Wine },
  coffee: { label: 'Coffee', icon: Coffee },
  activity: { label: 'Activity', icon: Ticket },
  shopping: { label: 'Shopping', icon: ShoppingBag },
  sightseeing: { label: 'Sightseeing', icon: Camera },
  nightlife: { label: 'Nightlife', icon: Moon },
  other: { label: 'Other', icon: Sparkles },
};

export function CategoryTag({ category, className }: { category: Category; className?: string }) {
  const { label, icon: Icon } = CATEGORY_META[category];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium text-muted ${className ?? ''}`}>
      <Icon size={13} strokeWidth={2} />
      {label}
    </span>
  );
}

export { CATEGORY_META };
