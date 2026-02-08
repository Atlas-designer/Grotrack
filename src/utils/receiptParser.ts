export interface ParsedReceiptItem {
  name: string;
  quantity: number;
  selected: boolean;
}

// Known store/brand names to filter out
const STORE_NAMES = /\b(sainsbury|tesco|asda|morrisons|waitrose|aldi|lidl|co-?op|marks\s*&?\s*spencer|m&s|walmart|target|kroger|costco|whole\s*foods)\b/i;

// Lines that are likely noise (not food items)
const NOISE_PATTERNS = [
  // Store info & headers
  STORE_NAMES,
  /supermarket/i,
  /\bltd\b/i,
  /\bplc\b/i,
  /\binc\b\.?$/i,
  /www\./i,
  /\.co\./i,
  /\.com/i,
  /vat\s*(number|no|#|reg)/i,
  /holborn|london|street|road|avenue|lane|drive|plaza|mall/i,
  /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/, // UK postcode
  /\b\d{5}(-\d{4})?\b/, // US zip code
  /live\s*well/i,
  /for\s*less/i,

  // Transaction info
  /^(sub\s*total|subtotal|total|tax|vat|gst|hst|change|cash|card|visa|master|amex|debit|credit|eftpos|balance)/i,
  /(sub\s*total|subtotal|total)\b/i,
  /^(thank|welcome|receipt|invoice|order|store|branch|tel|phone|fax|email|address)/i,
  /^(date|time|trans|ref|auth|appr|terminal|operator|cashier|server|table|guest)/i,
  /cashier\s*(confirmed|checked)/i,
  /confirmed\s*over\s*\d+/i,
  /think\s*\d+/i,
  /^(save|saving|you\s*saved|reward|points|loyalty|member|discount|promo|coupon)/i,
  /^(payment|paid|tender|amount\s*due|due|owing|net|gross)/i,
  /number\s*of\s*items/i,
  /\bchange\s*due\b/i,
  /\bclub\s*card\b/i,
  /\bnectar\b/i,
  /\bitems?\s*\d+\b/i,

  // Dates, times, pure numbers
  /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/, // dates
  /^\d{1,2}:\d{2}/, // times
  /^[\d\s\.\-\$\£\€\¥,]+$/, // price-only lines
  /^[#\*\-=_~|]{2,}/, // separators & OCR artifacts
  /^\s*$/, // empty lines
  /^x{2,}/i, // xxx patterns
];

// Pattern to detect a quantity prefix like "2x ", "3 x "
const QTY_PREFIX = /^(\d+)\s*[xX×]\s*/;

// Check if a line is mostly non-alpha characters (OCR garbage)
function isMostlyGarbage(text: string): boolean {
  const stripped = text.replace(/\s/g, '');
  if (stripped.length === 0) return true;
  const alphaCount = (stripped.match(/[a-zA-Z]/g) || []).length;
  const ratio = alphaCount / stripped.length;
  // If less than 60% of non-space characters are letters, it's probably garbage
  return ratio < 0.6;
}

// Check if line has too few actual words (likely OCR fragments)
function isTooFragmented(text: string): boolean {
  const words = text.split(/\s+/).filter((w) => w.length >= 2 && /[a-zA-Z]{2,}/.test(w));
  // If we don't have at least one real word of 3+ chars, skip
  return !words.some((w) => w.replace(/[^a-zA-Z]/g, '').length >= 3);
}

export function parseReceiptText(rawText: string): ParsedReceiptItem[] {
  const lines = rawText.split('\n');
  const items: ParsedReceiptItem[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    let cleaned = line.trim();

    // Skip very short lines (likely noise)
    if (cleaned.length < 3) continue;

    // Skip lines starting with special characters (OCR artifacts)
    if (/^[=\-~_|+<>@#\^]/.test(cleaned)) continue;

    // Strip trademark/registered/copyright symbols
    cleaned = cleaned.replace(/[™®©]/g, '').trim();

    // Skip lines that are mostly non-alphabetic (OCR garbage)
    if (isMostlyGarbage(cleaned)) continue;

    // Check noise patterns
    const isNoise = NOISE_PATTERNS.some((pattern) => pattern.test(cleaned));
    if (isNoise) continue;

    // Remove trailing prices and any junk after them
    // Matches: £4.00, $4.99, 4.99, followed by optional random chars/digits
    cleaned = cleaned.replace(/[\s]*[\$\£\€\¥]?\s*\d+[.,]\d{2}\s*[\w\-=~_—–|\.]*\s*$/, '').trim();

    // Remove leading asterisks (age-restricted item markers)
    cleaned = cleaned.replace(/^\*+\s*/, '').trim();

    // Remove leading item numbers/codes
    cleaned = cleaned.replace(/^\d{4,}\s+/, '').trim();

    // Remove trailing OCR junk (random dashes, equals, pipes, single chars at the end)
    cleaned = cleaned.replace(/[\s\-=~_—–|]+$/, '').trim();

    // Remove trailing single letter/digit fragments (like lone "B" or "8")
    cleaned = cleaned.replace(/\s+[A-Za-z0-9]$/, '').trim();

    // Skip if nothing left after cleanup
    if (cleaned.length < 3) continue;

    // Skip if it still looks like noise after cleanup
    if (/^[\d\s\.\-=~_|]+$/.test(cleaned)) continue;

    // Re-check garbage ratio after cleanup
    if (isMostlyGarbage(cleaned)) continue;

    // Skip OCR fragments with no real words
    if (isTooFragmented(cleaned)) continue;

    // Detect quantity prefix
    let quantity = 1;
    const qtyMatch = cleaned.match(QTY_PREFIX);
    if (qtyMatch) {
      quantity = parseInt(qtyMatch[1], 10);
      cleaned = cleaned.replace(QTY_PREFIX, '').trim();
    }

    // Capitalize first letter of each word for nicer display
    const name = cleaned
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();

    if (name.length < 3) continue;

    // Deduplicate: if we've seen this exact name, increment quantity instead
    const nameKey = name.toLowerCase();
    if (seen.has(nameKey)) {
      const existing = items.find((i) => i.name.toLowerCase() === nameKey);
      if (existing) {
        existing.quantity += quantity;
        continue;
      }
    }

    seen.add(nameKey);
    items.push({ name, quantity, selected: true });
  }

  return items;
}
