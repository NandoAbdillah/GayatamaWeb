import { NextRequest, NextResponse } from 'next/server';

// In-memory cache for Wikipedia summaries to prevent redundant network requests
const WIKI_CACHE = new Map<string, any>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || searchParams.get('title') || '';

  if (!query || query.trim().length === 0) {
    return NextResponse.json(
      { success: false, message: 'Parameter query atau title diperlukan' },
      { status: 400 }
    );
  }

  const cleanQuery = query.trim();
  const cacheKey = cleanQuery.toLowerCase();

  if (WIKI_CACHE.has(cacheKey)) {
    return NextResponse.json({
      success: true,
      source: 'cache',
      data: WIKI_CACHE.get(cacheKey),
    });
  }

  // Candidate titles to try against Indonesian Wikipedia REST API
  const candidates = [
    cleanQuery,
    cleanQuery.replace(/^Desa\s+/i, ''),
    cleanQuery.replace(/^Kelurahan\s+/i, ''),
    `Kecamatan_${cleanQuery.replace(/^Kecamatan\s+/i, '')}`,
    `Kabupaten_${cleanQuery.replace(/^Kabupaten\s+/i, '')}`,
    `Kota_${cleanQuery.replace(/^Kota\s+/i, '')}`,
  ];

  let resultData: any = null;

  for (const title of candidates) {
    try {
      const url = `https://id.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        title.replace(/\s+/g, '_')
      )}`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'BaktiNusantara/1.0 (https://baktinusantara.id; contact@baktinusantara.id)',
          Accept: 'application/json',
        },
        next: { revalidate: 86400 }, // cache 24h
      });

      if (res.ok) {
        const json = await res.json();
        if (json && json.extract && json.type !== 'https://mediawiki.org/wiki/HyperSwitch/errors/not_found') {
          resultData = {
            title: json.title,
            displaytitle: json.displaytitle || json.title,
            extract: json.extract,
            description: json.description || 'Wilayah di Indonesia',
            thumbnail: json.thumbnail ? json.thumbnail.source : null,
            originalImage: json.originalimage ? json.originalimage.source : null,
            coordinates: json.coordinates || null,
            pageUrl: json.content_urls?.desktop?.page || `https://id.wikipedia.org/wiki/${encodeURIComponent(title)}`,
          };
          break;
        }
      }
    } catch (e) {
      // Continue to next candidate
    }
  }

  if (resultData) {
    WIKI_CACHE.set(cacheKey, resultData);
    return NextResponse.json({
      success: true,
      source: 'wikipedia_id',
      data: resultData,
    });
  }

  // Graceful fallback if not found in Wikipedia
  const fallbackData = {
    title: cleanQuery,
    displaytitle: cleanQuery,
    extract: `${cleanQuery} merupakan wilayah potensial di Indonesia dengan beragam kearifan lokal, potensi komoditas unggulan desa, serta peluang program pemberdayaan masyarakat yang terintegrasi melalui KKN BaktiNusantara.`,
    description: 'Wilayah Binaan KKN BaktiNusantara',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    originalImage: null,
    coordinates: null,
    pageUrl: `https://id.wikipedia.org/w/index.php?search=${encodeURIComponent(cleanQuery)}`,
  };

  WIKI_CACHE.set(cacheKey, fallbackData);

  return NextResponse.json({
    success: true,
    source: 'generated_fallback',
    data: fallbackData,
  });
}
