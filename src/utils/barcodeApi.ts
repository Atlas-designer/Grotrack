import { FoodCategory, UnitType } from '../types';

export interface BarcodeProduct {
  name: string;
  brand: string;
  category: FoodCategory;
  sizeText: string;
  parsedQuantity?: number;
  parsedUnit?: UnitType;
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
 * Strip junk words from product names:
 * - Leading counts ("12 Free Range Eggs" → "Free Range Eggs")
 * - Percentages + "fat" ("1.8% Fat" → "")
 * - Nationality words ("British", "Scottish")
 * - Filler descriptors ("Free Range", "Fresh")
 */
function cleanName(name: string): string {
  let c = name;
  // Strip leading count (e.g., "12 Free Range Eggs")
  c = c.replace(/^\d+\s+/, '');
  // Strip percentage + optional "fat" (e.g., "1.8% Fat")
  c = c.replace(/\d+\.?\d*%\s*(fat\s*)?/gi, '');
  // Strip nationality words
  c = c.replace(/\b(British|Scottish|Welsh|English|Irish|European)\b\s*/gi, '');
  // Strip "Free Range"
  c = c.replace(/\bfree\s+range\b\s*/gi, '');
  // Strip "Fresh" (filler when alongside other descriptors)
  c = c.replace(/\bfresh\b\s*/gi, '');
  // Clean up double spaces
  c = c.replace(/\s{2,}/g, ' ').trim();
  return c || name;
}

/**
 * Parse OFF quantity/size text into a numeric quantity and unit.
 * Handles: "4 pints", "300 ml", "2.272 l", "500 g", "1.5 kg",
 *          "6 x 330 ml", "8 x 24.6g", "12" (pure count)
 */
function parseSizeText(sizeText: string): { quantity: number; unit: UnitType } | null {
  if (!sizeText) return null;
  const s = sizeText.toLowerCase().trim();

  // Multipack: "6 x 330 ml", "8 x 24.6g" → count of items
  const multiMatch = s.match(/^(\d+)\s*x\s/);
  if (multiMatch) return { quantity: parseInt(multiMatch[1]), unit: 'pieces' };

  // Pints → convert to ml/L
  const pintMatch = s.match(/^([\d.]+)\s*pints?\b/);
  if (pintMatch) {
    const totalMl = parseFloat(pintMatch[1]) * 568;
    if (totalMl >= 1000) return { quantity: Math.round(totalMl / 10) / 100, unit: 'L' };
    return { quantity: Math.round(totalMl), unit: 'ml' };
  }

  // Litres
  const lMatch = s.match(/^([\d.]+)\s*l\b/);
  if (lMatch) return { quantity: parseFloat(lMatch[1]), unit: 'L' };

  // Millilitres
  const mlMatch = s.match(/^([\d.]+)\s*ml\b/);
  if (mlMatch) return { quantity: parseFloat(mlMatch[1]), unit: 'ml' };

  // Centilitres → ml
  const clMatch = s.match(/^([\d.]+)\s*cl\b/);
  if (clMatch) return { quantity: parseFloat(clMatch[1]) * 10, unit: 'ml' };

  // Kilograms
  const kgMatch = s.match(/^([\d.]+)\s*kg\b/);
  if (kgMatch) return { quantity: parseFloat(kgMatch[1]), unit: 'kg' };

  // Grams
  const gMatch = s.match(/^([\d.]+)\s*g\b/);
  if (gMatch) return { quantity: parseFloat(gMatch[1]), unit: 'g' };

  // Pure count: "12"
  const countMatch = s.match(/^(\d+)$/);
  if (countMatch) return { quantity: parseInt(countMatch[1]), unit: 'pieces' };

  return null;
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
      return titleCase(cleanName(abbreviated));
    }
    // Use generic name if short (e.g., "Cola" instead of full description)
    if (generic && generic.length <= 30) {
      return titleCase(cleanName(`${brand} ${generic}`));
    }
    // Use brand + short part of name (first few words)
    if (nameWithoutBrand) {
      const shortName = nameWithoutBrand.split(/\s+/).slice(0, 3).join(' ');
      return titleCase(cleanName(`${brand} ${shortName}`));
    }
    return titleCase(brand);
  }

  // Name is reasonable length — use brand + cleaned name, or just the name
  if (brand && nameWithoutBrand) {
    return titleCase(cleanName(`${brand} ${nameWithoutBrand}`));
  }
  if (brand && !nameWithoutBrand) {
    return titleCase(brand);
  }
  return titleCase(cleanName(full));
}

const OVERRIDE_KEY = 'grotrack_barcode_names';

function getOverrides(): Record<string, BarcodeProduct> {
  try {
    return JSON.parse(localStorage.getItem(OVERRIDE_KEY) || '{}');
  } catch { return {}; }
}

export function saveBarcodeOverride(barcode: string, name: string, category: FoodCategory): void {
  const overrides = getOverrides();
  const existing = overrides[barcode];
  overrides[barcode] = {
    name,
    brand: existing?.brand || '',
    category,
    sizeText: existing?.sizeText || '',
  };
  localStorage.setItem(OVERRIDE_KEY, JSON.stringify(overrides));
}

export async function lookupBarcode(barcode: string): Promise<BarcodeProduct | null> {
  // Check user overrides first (edited names from previous scans)
  const override = getOverrides()[barcode];
  if (override) return override;

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
    if (!product?.product_name && !product?.brands) return null;

    const name = buildName(product);
    const brand = (product.brands || '').split(',')[0].trim();
    const sizeText = (product.quantity || '').trim();
    const category = mapCategory(product.categories_tags || []);
    const parsed = parseSizeText(sizeText);

    return {
      name,
      brand,
      category,
      sizeText,
      parsedQuantity: parsed?.quantity,
      parsedUnit: parsed?.unit,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
