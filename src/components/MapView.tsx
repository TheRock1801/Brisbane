'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { DAYS, DAY_LABELS, type Day, type IdeaWithState } from '@/lib/types';
import { DAY_COLORS } from '@/lib/day-colors';
import { starLabel } from '@/lib/profiles';
import type { Accommodation } from '@/lib/types';
import { cn } from '@/lib/cn';

type Layer = 'planning' | 'starred' | 'actual';

const BRISBANE_CENTER: [number, number] = [153.0251, -27.4698];

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

function popupHtml(idea: IdeaWithState): string {
  const time = idea.itinerary?.start_time ? idea.itinerary.start_time.slice(0, 5) : null;
  const stars = starLabel(idea.stars);
  return `
    <div style="width:200px;font-family:inherit">
      ${idea.image_url ? `<div style="width:100%;height:96px;border-radius:12px;overflow:hidden;margin-bottom:8px"><img src="${escapeHtml(idea.image_url)}" style="width:100%;height:100%;object-fit:cover" /></div>` : ''}
      <p style="font-weight:600;font-size:14px;margin:0 0 2px">${escapeHtml(idea.name)}</p>
      <p style="font-size:12px;color:var(--muted);margin:0 0 6px">
        ${escapeHtml(DAY_LABELS[idea.day])}${time ? ` · ${time}` : ''}
      </p>
      ${stars ? `<p style="font-size:12px;margin:0 0 6px">${escapeHtml(stars)}</p>` : ''}
      <a href="/idea/${idea.id}" style="font-size:12px;font-weight:600;color:var(--accent);text-decoration:none">View details →</a>
    </div>
  `;
}

function makePin(color: string, size = 14) {
  const el = document.createElement('div');
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.borderRadius = '50%';
  el.style.background = color;
  el.style.border = '2px solid white';
  el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.35)';
  return el;
}

export function MapView({
  ideas,
  accommodation,
}: {
  ideas: IdeaWithState[];
  accommodation: Accommodation[];
}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [ready, setReady] = useState(false);
  const [layers, setLayers] = useState<Record<Layer, boolean>>({
    planning: false,
    starred: true,
    actual: true,
  });
  const [routeDay, setRouteDay] = useState<Day | null>(null);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!token || !mapContainer.current || map.current) return;
    mapboxgl.accessToken = token;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: BRISBANE_CENTER,
      zoom: 12,
    });
    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
    map.current.on('load', () => setReady(true));
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [token]);

  // Markers
  useEffect(() => {
    if (!ready || !map.current) return;
    markers.current.forEach((m) => m.remove());
    markers.current = [];

    const located = ideas.filter((i) => i.latitude != null && i.longitude != null);

    for (const idea of located) {
      const isStarred = idea.stars.length > 0;
      const isActual = Boolean(idea.itinerary);

      let color: string | null = null;
      if (layers.planning && !isStarred) color = 'var(--muted)';
      if (layers.starred && isStarred && !isActual) color = 'var(--accent)';
      if (layers.actual && isActual) color = DAY_COLORS[idea.day];
      if (!color) continue;

      const el = makePin(color, isActual ? 16 : 12);
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([idea.longitude!, idea.latitude!])
        .setPopup(new mapboxgl.Popup({ offset: 12 }).setHTML(popupHtml(idea)))
        .addTo(map.current);
      markers.current.push(marker);
    }

    for (const stay of accommodation) {
      if (stay.latitude == null || stay.longitude == null) continue;
      const el = makePin('var(--foreground)', 18);
      el.style.borderRadius = '6px';
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([stay.longitude, stay.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 12 }).setHTML(
            `<div style="font-family:inherit"><p style="font-weight:600;font-size:14px;margin:0">${escapeHtml(stay.name)}</p><p style="font-size:12px;color:var(--muted);margin:2px 0 0">${escapeHtml(stay.address ?? '')}</p></div>`
          )
        )
        .addTo(map.current);
      markers.current.push(marker);
    }
  }, [ready, ideas, accommodation, layers]);

  // Daily route line
  useEffect(() => {
    if (!ready || !map.current) return;
    const SOURCE_ID = 'daily-route';
    const LAYER_ID = 'daily-route-line';

    if (map.current.getLayer(LAYER_ID)) map.current.removeLayer(LAYER_ID);
    if (map.current.getSource(SOURCE_ID)) map.current.removeSource(SOURCE_ID);

    if (!routeDay) return;

    const points = ideas
      .filter(
        (i) =>
          i.day === routeDay &&
          i.itinerary?.start_time &&
          i.latitude != null &&
          i.longitude != null
      )
      .sort((a, b) => (a.itinerary!.start_time! < b.itinerary!.start_time! ? -1 : 1));

    if (points.length < 2) return;

    map.current.addSource(SOURCE_ID, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: points.map((p) => [p.longitude!, p.latitude!]),
        },
      },
    });
    map.current.addLayer({
      id: LAYER_ID,
      type: 'line',
      source: SOURCE_ID,
      paint: {
        'line-color': DAY_COLORS[routeDay],
        'line-width': 3,
        'line-dasharray': [0.4, 1.6],
      },
    });
  }, [ready, routeDay, ideas]);

  if (!token) {
    return (
      <div className="mx-4 mt-8 rounded-3xl border border-dashed border-border-subtle p-8 text-center">
        <p className="text-sm text-muted">
          Map isn&apos;t set up yet — add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex-1">
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3">
        {(
          [
            ['planning', 'Planning'],
            ['starred', 'Starred'],
            ['actual', 'Actual'],
          ] as [Layer, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setLayers((l) => ({ ...l, [key]: !l[key] }))}
            className={cn(
              'shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium',
              layers[key]
                ? 'border-transparent bg-accent text-accent-foreground'
                : 'border-border-subtle text-muted'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3">
        <span className="shrink-0 self-center text-xs font-medium text-muted">Route:</span>
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => setRouteDay((d) => (d === day ? null : day))}
            className={cn(
              'shrink-0 rounded-full border px-3 py-1 text-xs font-medium',
              routeDay === day ? 'text-white border-transparent' : 'border-border-subtle text-muted'
            )}
            style={routeDay === day ? { background: DAY_COLORS[day] } : undefined}
          >
            {DAY_LABELS[day]}
          </button>
        ))}
      </div>
      {routeDay && (
        <p className="px-4 pb-2 text-xs text-muted">
          Dashed line connects {DAY_LABELS[routeDay]}&apos;s scheduled stops in order — itinerary
          order, not a real navigation route.
        </p>
      )}

      <div ref={mapContainer} className="h-[60vh] w-full sm:h-[70vh]" />
    </div>
  );
}
