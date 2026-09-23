'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Lightbulb, CalendarCheck, MapPin, Briefcase } from 'lucide-react';
import { cn } from '@/lib/cn';

const TABS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/planning', label: 'Planning', icon: Lightbulb },
  { href: '/actual', label: 'Actual', icon: CalendarCheck },
  { href: '/map', label: 'Map', icon: MapPin },
  { href: '/trip', label: 'Trip', icon: Briefcase },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border-subtle bg-surface/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-lg items-stretch justify-between px-2">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium"
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.4 : 1.8}
                className={cn('transition-colors', active ? 'text-accent' : 'text-muted')}
              />
              <span className={cn(active ? 'text-accent' : 'text-muted')}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
