export interface ParsedReceiptItem {
  name: string;
  quantity: number;
  selected: boolean;
  barcode?: string;
}

// A line must contain a price to be considered a purchased item
// Matches: £4.00, $4.99, €1.50, 4.99, etc.
const PRICE_PATTERN = /[\$\£\€\¥]?\s*\d+[.,]\d{2}/;

// Negative prices indicate savings/reductions (Nectar, coupons, etc.)
const NEGATIVE_PRICE = /[-–—]\s*[\$\£\€\¥]?\s*\d+[.,]\d{2}/;

// Lines that are noise even if they have a price next to them
const NOISE_PATTERNS = [
  // Transaction / financial lines
  /\b(sub\s*total|subtotal|total)\b/i,
  /\b(vat|tax|gst|hst)\b/i,
  /\b(balance|remaining\s*balance|card\s*balance)\b/i,
  /\b(change\s*due|cash\s*back|cashback)\b/i,
  /\b(discount|reduction|item\s*reduction|reduced|price\s*match)\b/i,
  /\b(saving|you\s*saved|multi\s*buy|meal\s*deal)\b/i,
  /\b(payment|paid|tender|amount\s*due|amount\s*owing)\b/i,
  /\b(refund|void|cancel|error)\b/i,
  /\b(deposit|bag\s*charge|carrier\s*bag|bag\s*for\s*life|bag)\b/i,

  // Age checks / verification
  /\bthink\s*25\b/i,
  /\bcashier\s*confirmed\b/i,
  /\bover\s*\d+\b/i,

  // Payment methods / card details
  /\b(amex|visa|mastercard|maestro|debit|credit)\b/i,
  /\bcontactless\b/i,
  /\bbalance\s*due\b/i,
  /\bcard\s*(number|no|ending)\b/i,

  // Price labels
  /\b(original\s*price|was\s*price)\b/i,
  /\b(price|priced)\b/i,

  // Store / receipt metadata
  /\b(sainsbury|tesco|asda|morrisons|waitrose|aldi|lidl|co-?op|m&s)\b/i,
  /\b(smartshop|self\s*serve|hand\s*held|scan\s*&?\s*go|scan\s*and\s*go)\b/i,
  /\b(tid\s*value|tid|mid|aid|auth\s*code|appr\s*code)\b/i,
  /\b(club\s*card|nectar|reward|points|loyalty|member)\b/i,
  /\b(cashier|operator|server|terminal|store\s*#?)\b/i,
  /\b(receipt|invoice|transaction|order\s*#?)\b/i,
  /\b(tel|phone|fax|www\.|\.co\.|\.com)\b/i,
  /\b(ltd|plc)\b/i,

  // Dates, times, pure numbers
  /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/, // dates
  /^\d{1,2}:\d{2}/, // times
  /^[#\*\-=_~|]{2,}/, // separators & OCR artifacts
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

    // ── KEY FILTER: only lines with a price are purchased items ──
    // If a line doesn't have a price next to it, it's not an item
    if (!PRICE_PATTERN.test(cleaned)) continue;

    // Skip negative prices (Nectar savings, reductions, coupons)
    if (NEGATIVE_PRICE.test(cleaned)) continue;

    // Skip lines that are mostly non-alphabetic (OCR garbage)
    if (isMostlyGarbage(cleaned)) continue;

    // Check noise patterns (transaction lines that have prices, like TOTAL £23.50)
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

    // Strip weight/size suffixes (200G, 1.5KG, 500ML, 2L, X4, 10PK)
    cleaned = cleaned.replace(/\b\d+(\.\d+)?\s*(kg|g|ml|l|ltr|ltrs|cl|oz|lb|pt|fl)\b/gi, '').trim();
    cleaned = cleaned.replace(/\bx\s*\d+\b/gi, '').trim();
    cleaned = cleaned.replace(/\b\d+\s*(pk|pck|pack)\b/gi, '').trim();

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
