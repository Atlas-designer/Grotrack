import { FoodCategory } from '../types';

export interface BarcodeProduct {
  name: string;
  brand: string;
  category: FoodCategory;
  sizeText: string;
}

const OFF_CATEGORY_MAP: Record<string, FoodCategory> = {
  'en:dairies': 'dairy', 'en:milks': 'dairy', 'en:cheeses': 'dairy',
  'en:yogurts': 'dairy', 'en:butters': 'dairy', 'en:creams': 'dairy', 'en:eggs': 'dairy',

  'en:meats': 'meat', 'en:poultry': 'meat', 'en:chicken': 'meat',
  'en:beef': 'meat', 'en:pork': 'meat', 'en:lamb': 'meat',
  'en:fishes': 'meat', 'en:seafood': 'meat',

  'en:fruits': 'produce', 'en:vegetables': 'produce',
  'en:fresh-vegetables': 'produce', 'en:fresh-fruits': 'produce',

  'en:frozen-foods': 'frozen', 'en:frozen-vegetables': 'frozen',
  'en:ice-creams-and-sorbets': 'frozen',

  'en:canned-foods': 'canned', 'en:canned-vegetables': 'canned',
  'en:canned-legumes': 'canned',

  'en:breads': 'dry-goods', 'en:cereals-and-potatoes': 'dry-goods',
  'en:pastas': 'dry-goods', 'en:rices': 'dry-goods', 'en:flours': 'dry-goods',
  'en:cereals': 'dry-goods',

  'en:snacks': 'snacks', 'en:sweet-snacks': 'snacks', 'en:salty-snacks': 'snacks',
  'en:biscuits-and-cakes': 'snacks', 'en:chocolates': 'snacks', 'en:confectioneries': 'snacks',
  'en:crisps': 'snacks', 'en:chips': 'snacks',

  'en:beverages': 'beverages', 'en:waters': 'beverages', 'en:fruit-juices': 'beverages',
  'en:sodas': 'beverages', 'en:teas': 'beverages', 'en:coffees': 'beverages',

  'en:sauces': 'condiments', 'en:condiments': 'condiments', 'en:dressings': 'condiments',
  'en:spices': 'condiments', 'en:oils': 'condiments', 'en:vinegars': 'condiments',
};

function mapCategory(tags: string[]): FoodCategory {
  for (const tag of tags) {
    if (OFF_CATEGORY_MAP[tag]) return OFF_CATEGORY_MAP[tag];
  }
  for (const tag of tags) {
    for (const [key, cat] of Object.entries(OFF_CATEGORY_MAP)) {
      if (tag.includes(key.replace('en:', '')) || key.includes(tag.replace('en:', ''))) {
        return cat;
      }
    }
  }
  return 'other';
}

function titleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Build a clean, short product name from OFF data.
 * Priority: brand + short name > abbreviated name > brand alone > product_name (truncated)
 */
function buildName(product: any): string {
  const brand = (product.brands || '').split(',')[0].trim();
  const abbreviated = (product.abbreviated_product_name || '').trim();
  const generic = (product.generic_name || '').trim();
  let full = (product.product_name || '').trim();

  // If brand exists, strip it from the full name to avoid "Pepsi Pepsi Max"
  let nameWithoutBrand = full;
  if (brand && full.toLowerCase().startsWith(brand.toLowerCase())) {
    nameWithoutBrand = full.slice(brand.length).replace(/^[\s\-:,]+/, '').trim();
  }

  // If the full product_name is very long (legal description), prefer brand-based name
  if (brand && full.length > 40) {
    // Use abbreviated name if available and short
    if (abbreviated && abbreviated.length <= 40) {
      return titleCase(abbreviated);
    }
    // Use generic name if short (e.g., "Cola" instead of full description)
    if (generic && generic.length <= 30) {
      return titleCase(`${brand} ${generic}`);
    }
    // Use brand + short part of name (first few words)
    if (nameWithoutBrand) {
      const shortName = nameWithoutBrand.split(/\s+/).slice(0, 3).join(' ');
      return titleCase(`${brand} ${shortName}`);
    }
    return titleCase(brand);
  }

  // Name is reasonable length — use brand + cleaned name, or just the name
  if (brand && nameWithoutBrand) {
    return titleCase(`${brand} ${nameWithoutBrand}`);
  }
  if (brand && !nameWithoutBrand) {
    return titleCase(brand);
  }
  return titleCase(full);
}

export async function lookupBarcode(barcode: string): Promise<BarcodeProduct | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=product_name,brands,quantity,categories_tags,abbreviated_product_name,generic_name`,
      {
        signal: controller.signal,
        headers: { 'User-Agent': 'Grotrack/1.0' },
      }
    );

    const data = await res.json();
    if (data.status !== 1) return null;

    const product = data.product;
    // Accept if we have at least a product_name or brand
    if (!product?.product_name && !product?.brands) return null;

    const name = buildName(product);
    const brand = (product.brands || '').split(',')[0].trim();
    const sizeText = (product.quantity || '').trim();
    const category = mapCategory(product.categories_tags || []);

    // Append size to name if it's useful (e.g., "Pepsi Max 2L")
    const displayName = sizeText ? `${name} ${sizeText}` : name;

    return { name: displayName, brand, category, sizeText };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
