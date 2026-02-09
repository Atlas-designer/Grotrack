// Open Food Facts API utility for fetching product images
// API docs: https://openfoodfacts.github.io/openfoodfacts-server/api/

const BASE_URL = 'https://world.openfoodfacts.org';
const USER_AGENT = 'Grotrack/1.0 (https://grotrack.netlify.app)';
const SEARCH_FIELDS = 'code,product_name,brands,image_front_small_url,image_front_url';

// Rate limiting: max 10 searches/min
let lastSearchTime = 0;
const MIN_SEARCH_INTERVAL = 6500; // 6.5s between searches to stay under 10/min

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const elapsed = now - lastSearchTime;
  if (elapsed < MIN_SEARCH_INTERVAL) {
    await new Promise((r) => setTimeout(r, MIN_SEARCH_INTERVAL - elapsed));
  }
  lastSearchTime = Date.now();
  return fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
  });
}

export interface OFFProduct {
  code: string;
  product_name?: string;
  brands?: string;
  image_front_small_url?: string;
  image_front_url?: string;
}

/**
 * Search Open Food Facts by product name.
 * Returns the best match image URL, or null if not found.
 */
export async function searchProductImage(name: string): Promise<string | null> {
  if (!name || name.trim().length < 2) return null;

  try {
    const params = new URLSearchParams({
      search_terms: name.trim(),
      action: 'process',
      json: '1',
      page_size: '5',
      sort_by: 'unique_scans_n',
      fields: SEARCH_FIELDS,
    });

    const res = await rateLimitedFetch(`${BASE_URL}/cgi/search.pl?${params}`);
    if (!res.ok) return null;

    const data = await res.json();
    const products: OFFProduct[] = data.products || [];

    // Find the first product that has an image and a name
    for (const product of products) {
      const imageUrl = product.image_front_small_url || product.image_front_url;
      if (imageUrl && product.product_name) {
        return imageUrl;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Look up a product by barcode.
 * Returns image URL and product name, or null.
 */
export async function lookupBarcode(
  barcode: string
): Promise<{ imageUrl: string; name: string } | null> {
  if (!barcode) return null;

  try {
    const res = await fetch(
      `${BASE_URL}/api/v2/product/${barcode}.json?fields=${SEARCH_FIELDS}`,
      { headers: { 'User-Agent': USER_AGENT } }
    );
    if (!res.ok) return null;

    const data = await res.json();
    if (data.status !== 1 || !data.product) return null;

    const product = data.product as OFFProduct;
    const imageUrl = product.image_front_small_url || product.image_front_url;
    if (!imageUrl) return null;

    return {
      imageUrl,
      name: product.product_name || '',
    };
  } catch {
    return null;
  }
}

/**
 * Batch fetch images for multiple item names.
 * Uses the house image cache to avoid redundant API calls.
 * Returns a map of itemName -> imageUrl.
 */
export async function batchFetchImages(
  names: string[],
  imageCache: Record<string, string>
): Promise<Record<string, string>> {
  const results: Record<string, string> = {};

  // First, resolve from cache
  const uncached: string[] = [];
  for (const name of names) {
    const key = name.toLowerCase().trim();
    if (imageCache[key]) {
      results[name] = imageCache[key];
    } else {
      uncached.push(name);
    }
  }

  // Fetch uncached items from API (rate-limited, sequential)
  for (const name of uncached) {
    const imageUrl = await searchProductImage(name);
    if (imageUrl) {
      results[name] = imageUrl;
    }
  }

  return results;
}
