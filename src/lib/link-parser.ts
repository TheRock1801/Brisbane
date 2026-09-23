import 'server-only';
import * as cheerio from 'cheerio';
import type { Category } from '@/lib/types';

export interface ParsedLink {
  name: string | null;
  image_url: string | null;
  description: string | null;
  address: string | null;
  suburb: string | null;
  category: Category | null;
  source_url: string;
}

const BRISBANE_SUBURBS = [
  'Fortitude Valley', 'New Farm', 'Newstead', 'Teneriffe', 'South Brisbane',
  'West End', 'Kangaroo Point', 'East Brisbane', 'Woolloongabba', 'Highgate Hill',
  'Paddington', 'Milton', 'Toowong', 'St Lucia', 'Spring Hill', 'Bowen Hills',
  'Brisbane City', 'CBD', 'Petrie Terrace', 'Red Hill', 'Ascot', 'Hamilton',
  'Mount Coot-tha', 'Mount Coot tha', 'Wooloowin', 'Albion',
];

const CATEGORY_KEYWORDS: [RegExp, Category][] = [
  [/\b(cafe|coffee|espresso|roaster)\b/i, 'coffee'],
  [/\b(bar|brewery|brewing|pub|wine|cocktail|taproom)\b/i, 'drinks'],
  [/\b(nightclub|club|late night|dj)\b/i, 'nightlife'],
  [/\b(restaurant|bistro|eatery|kitchen|dining|food|pizza|noodle)\b/i, 'food'],
  [/\b(gallery|museum|lookout|park|garden|landmark|bridge)\b/i, 'sightseeing'],
  [/\b(shop|store|market|boutique|mall)\b/i, 'shopping'],
  [/\b(climb|tour|cruise|kayak|bike|adventure|class|ticket)\b/i, 'activity'],
];

function meta($: cheerio.CheerioAPI, ...names: string[]): string | null {
  for (const name of names) {
    const byProperty = $(`meta[property="${name}"]`).attr('content');
    if (byProperty) return byProperty.trim();
    const byName = $(`meta[name="${name}"]`).attr('content');
    if (byName) return byName.trim();
  }
  return null;
}

function guessSuburb(text: string): string | null {
  const lower = text.toLowerCase();
  for (const suburb of BRISBANE_SUBURBS) {
    if (lower.includes(suburb.toLowerCase())) return suburb;
  }
  return null;
}

function guessCategory(text: string): Category | null {
  for (const [pattern, category] of CATEGORY_KEYWORDS) {
    if (pattern.test(text)) return category;
  }
  return null;
}

/**
 * Best-effort OG-tag scrape. Never throws for a page it can't parse — callers
 * should fall back to "just save the URL, let the user fill in the rest".
 */
export async function parseLink(url: string): Promise<ParsedLink> {
  const base: ParsedLink = {
    name: null,
    image_url: null,
    description: null,
    address: null,
    suburb: null,
    category: null,
    source_url: url,
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; BrisbaneTripBot/1.0; +https://github.com/TheRock1801/Brisbane)',
      },
    });
    clearTimeout(timeout);
    if (!res.ok) return base;

    const html = await res.text();
    const $ = cheerio.load(html);

    const name = meta($, 'og:title', 'twitter:title') ?? ($('title').first().text().trim() || null);
    const image_url = meta($, 'og:image', 'twitter:image');
    const description = meta($, 'og:description', 'twitter:description', 'description');
    const address =
      meta($, 'business:contact_data:street_address') ??
      meta($, 'place:location:street_address');

    const haystack = [name, description, address, html.slice(0, 20000)].filter(Boolean).join(' ');

    return {
      ...base,
      name,
      image_url,
      description,
      address,
      suburb: guessSuburb(haystack),
      category: guessCategory(haystack),
    };
  } catch {
    return base;
  }
}
