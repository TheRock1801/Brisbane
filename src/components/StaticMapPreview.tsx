import Link from 'next/link';

/** A static Mapbox image — no client-side map JS needed for a detail-view preview. */
export function StaticMapPreview({
  latitude,
  longitude,
  href = '/map',
}: {
  latitude: number;
  longitude: number;
  href?: string;
}) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) return null;

  const src = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+ff5a5f(${longitude},${latitude})/${longitude},${latitude},14,0/640x240@2x?access_token=${token}`;

  return (
    <Link href={href} className="block overflow-hidden rounded-2xl border border-border-subtle">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="Map preview" className="h-32 w-full object-cover" loading="lazy" />
    </Link>
  );
}
