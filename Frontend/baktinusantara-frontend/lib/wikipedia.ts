export interface WikipediaSummary {
  title: string;
  displaytitle: string;
  extract: string;
  description: string;
  thumbnail: string | null;
  originalImage: string | null;
  coordinates: {
    lat: number;
    lon: number;
  } | null;
  pageUrl: string;
}

export async function fetchWikipediaSummary(query: string): Promise<WikipediaSummary | null> {
  if (!query || query.trim().length === 0) return null;

  try {
    const res = await fetch(`/api/wilayah/wikipedia?query=${encodeURIComponent(query.trim())}`);
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && json.data) {
      return json.data as WikipediaSummary;
    }
    return null;
  } catch (error) {
    console.warn('Error fetching wikipedia summary:', error);
    return null;
  }
}
