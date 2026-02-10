import { FoodCategory } from '../types';

export interface BarcodeProduct {
  name: string;
  brand: string;
  category: FoodCategory;
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
  // Check if any tag contains a mapped key
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

export async function lookupBarcode(barcode: string): Promise<BarcodeProduct | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=product_name,brands,categories_tags`,
      {
        signal: controller.signal,
        headers: { 'User-Agent': 'Grotrack/1.0' },
      }
    );

    const data = await res.json();
    if (data.status !== 1 || !data.product?.product_name) return null;

    const product = data.product;
    let name = product.product_name || '';
    const brand = product.brands || '';

    // Strip brand from start of name if duplicated
    if (brand && name.toLowerCase().startsWith(brand.toLowerCase())) {
      name = name.slice(brand.length).trim();
      if (name.startsWith('-') || name.startsWith(':')) name = name.slice(1).trim();
    }

    name = titleCase(name.trim()) || titleCase(brand);
    const category = mapCategory(product.categories_tags || []);

    return { name, brand, category };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
