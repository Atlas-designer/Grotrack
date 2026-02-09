// Open Food Facts API utility for fetching product images
// Uses the newer Elasticsearch-based search API for reliability

const SEARCH_URL = 'https://search.openfoodfacts.org/search';
const PRODUCT_URL = 'https://world.openfoodfacts.org/api/v2/product';
const SEARCH_FIELDS = 'code,product_name,brands,image_front_small_url,image_front_url';
const FETCH_TIMEOUT = 8000; // 8 second timeout

// Rate limiting: max 10 searches/min
let lastSearchTime = 0;
const MIN_SEARCH_INTERVAL = 6500;

function fetchWithTimeout(url: string, timeoutMs = FETCH_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const elapsed = now - lastSearchTime;
  if (elapsed < MIN_SEARCH_INTERVAL) {
    await new Promise((r) => setTimeout(r, MIN_SEARCH_INTERVAL - elapsed));
  }
  lastSearchTime = Date.now();
  return fetchWithTimeout(url);
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
      q: name.trim(),
      fields: SEARCH_FIELDS,
      page_size: '5',
    });

    const url = `${SEARCH_URL}?${params}`;
    console.log('[OFF] Searching:', name.trim());
    const res = await rateLimitedFetch(url);

    if (!res.ok) {
      console.warn('[OFF] Search failed:', res.status, res.statusText);
      return null;
    }

    const data = await res.json();
    const products: OFFProduct[] = data.hits || data.products || [];
    console.log('[OFF] Found', products.length, 'products for', name.trim());

    // Find the first product that has an image and a name
    for (const product of products) {
      const imageUrl = product.image_front_small_url || product.image_front_url;
      if (imageUrl && product.product_name) {
        console.log('[OFF] Using image from:', product.product_name);
        return imageUrl;
      }
    }

    return null;
  } catch (err) {
    console.error('[OFF] Search error:', err);
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
    const res = await fetchWithTimeout(
      `${PRODUCT_URL}/${barcode}.json?fields=${SEARCH_FIELDS}`
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
  } catch (err) {
    console.error('[OFF] Barcode lookup error:', err);
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

  const uncached: string[] = [];
  for (const name of names) {
    const key = name.toLowerCase().trim();
    if (imageCache[key]) {
      results[name] = imageCache[key];
    } else {
      uncached.push(name);
    }
  }

  for (const name of uncached) {
    const imageUrl = await searchProductImage(name);
    if (imageUrl) {
      results[name] = imageUrl;
    }
  }

  return results;
}
