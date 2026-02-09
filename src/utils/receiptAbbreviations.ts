// Built-in dictionary of common UK receipt abbreviations
// Maps lowercase abbreviated forms to their expanded versions
// Includes both word-level abbreviations and multi-word shortcuts

// ── Supermarket own-brand prefixes (sorted longest-first) ──────────────
// These appear at the start of receipt lines and should be stripped to get
// the actual product name. Covers Sainsbury's sub-brands and other UK stores.
const BRAND_PREFIXES: string[] = [
  "hubbard's foodstore",
  'imperfectly tasty',
  "mary ann's dairy",
  'mary ann dairies',
  'stamford street',
  "j.james & family",
  'mary ann dairy',
  "by sainsbury's",
  'by sainsburys',
  "greengrocer's",
  'greengrocer',
  'premier deli',
  'dairy pride',
  "fisherman's",
  'wild valley',
  "sainsbury's",
  'sainsburys',
  'mary ann d',
  'just snax',
  'house 24/7',
  'house 247',
  'fisherman',
  "hubbard's",
  'hubbards',
  "lovett's",
  'lovetts',
  'allcroft',
  'j.james',
  'j james',
  "daily's",
  'scottish',
  'novon',
  'crown',
  'jjf',
  'jj',
  'js',
];

// SKU jargon words that should be stripped entirely — they describe
// product characteristics for stock purposes but aren't useful for users
const SKU_JARGON = new Set([
  'fc',       // From Concentrate
  'nas',      // No Added Sugar
  'cw',       // Counter Weight (variable weight)
  'cwt',      // Counter Weight
  'dblecon',  // Double Concentrate
  'mps',      // Multi Pack Saver
  'ttd',      // Taste the Difference (Sainsbury's premium)
  'bol',      // Bag of Life
  'bfm',      // Butchers Fresh Meat
  'std',      // Standard
]);

const WORD_ABBREVIATIONS: Record<string, string> = {
  // Proteins
  'chckn': 'chicken',
  'chkn': 'chicken',
  'chick': 'chicken',
  'brst': 'breast',
  'brsts': 'breasts',
  'thgh': 'thigh',
  'thghs': 'thighs',
  'drmsck': 'drumstick',
  'drmsks': 'drumsticks',
  'wngs': 'wings',
  'ssg': 'sausage',
  'ssge': 'sausage',
  'ssgs': 'sausages',
  'ssges': 'sausages',
  'bcn': 'bacon',
  'bcon': 'bacon',
  'slmn': 'salmon',
  'prwns': 'prawns',
  'prwn': 'prawn',
  'trky': 'turkey',
  'lmb': 'lamb',
  'gmmon': 'gammon',
  'gmmn': 'gammon',
  'mnce': 'mince',
  'mncd': 'minced',

  // Dairy
  'mlk': 'milk',
  'chse': 'cheese',
  'chees': 'cheese',
  'yghrt': 'yoghurt',
  'ygrt': 'yoghurt',
  'yogrt': 'yoghurt',
  'bttr': 'butter',
  'btr': 'butter',
  'crm': 'cream',
  'eg': 'egg',
  'egs': 'eggs',

  // Produce
  'tmto': 'tomato',
  'tmtos': 'tomatoes',
  'toms': 'tomatoes',
  'ptto': 'potato',
  'pttos': 'potatoes',
  'pots': 'potatoes',
  'onio': 'onion',
  'onns': 'onions',
  'grlc': 'garlic',
  'grlic': 'garlic',
  'crrt': 'carrot',
  'crrts': 'carrots',
  'brccli': 'broccoli',
  'broc': 'broccoli',
  'mshrm': 'mushroom',
  'mshrms': 'mushrooms',
  'mshm': 'mushroom',
  'mshms': 'mushrooms',
  'ccmbr': 'cucumber',
  'cucmbr': 'cucumber',
  'ppprs': 'peppers',
  'pppr': 'pepper',
  'lttce': 'lettuce',
  'spnch': 'spinach',
  'clry': 'celery',
  'crgtte': 'courgette',
  'aubrgn': 'aubergine',
  'asprgs': 'asparagus',
  'swcorn': 'sweetcorn',
  'swt': 'sweet',
  'btrnt': 'butternut',
  'prsnp': 'parsnip',
  'prsnps': 'parsnips',
  'beetrt': 'beetroot',

  // Fruit
  'strwb': 'strawberry',
  'strwbs': 'strawberries',
  'strwbry': 'strawberry',
  'strwbrry': 'strawberry',
  'blbry': 'blueberry',
  'blbrys': 'blueberries',
  'blubry': 'blueberry',
  'rspbry': 'raspberry',
  'rspbrys': 'raspberries',
  'raspbry': 'raspberry',
  'bnan': 'banana',
  'bnna': 'banana',
  'bnnas': 'bananas',
  'orng': 'orange',
  'orngs': 'oranges',
  'lmn': 'lemon',
  'lmns': 'lemons',
  'grps': 'grapes',
  'avcd': 'avocado',
  'avcdo': 'avocado',
  'pnppl': 'pineapple',
  'mln': 'melon',
  'wtrmln': 'watermelon',
  'mng': 'mango',
  'mngo': 'mango',
  'stsma': 'satsuma',
  'stsmas': 'satsumas',
  'clmntne': 'clementine',
  'clmntns': 'clementines',

  // Bread & bakery
  'brd': 'bread',
  'whl': 'whole',
  'whlml': 'wholemeal',
  'whmeal': 'wholemeal',
  'srdgh': 'sourdough',
  'crssnt': 'croissant',
  'crsnts': 'croissants',
  'wrp': 'wrap',
  'wrps': 'wraps',
  'trtlla': 'tortilla',
  'trtlls': 'tortillas',
  'bgl': 'bagel',
  'bgls': 'bagels',
  'crmpt': 'crumpet',
  'crmpts': 'crumpets',

  // Pantry
  'psta': 'pasta',
  'spghti': 'spaghetti',
  'spghtti': 'spaghetti',
  'ndls': 'noodles',
  'ndl': 'noodle',
  'flr': 'flour',
  'flwr': 'flour',
  'sgr': 'sugar',
  'cstr': 'caster',
  'rce': 'rice',
  'bsmti': 'basmati',
  'cscous': 'couscous',
  'qnoa': 'quinoa',

  // Cereals
  'crl': 'cereal',
  'prdge': 'porridge',
  'grnla': 'granola',
  'msli': 'muesli',

  // Canned
  'bkd': 'baked',
  'bns': 'beans',
  'chpd': 'chopped',
  'tnd': 'tinned',
  'cnd': 'canned',
  'tn': 'tin',
  'tns': 'tins',
  'chckps': 'chickpeas',
  'lntls': 'lentils',
  'kdny': 'kidney',

  // Condiments
  'ktchp': 'ketchup',
  'myo': 'mayo',
  'mynnse': 'mayonnaise',
  'mstrd': 'mustard',
  'vnegr': 'vinegar',
  'vngar': 'vinegar',
  'sce': 'sauce',
  'psto': 'pesto',
  'hmms': 'hummus',
  'hmous': 'houmous',
  'chtnty': 'chutney',

  // Snacks
  'bisc': 'biscuit',
  'biscs': 'biscuits',
  'bscts': 'biscuits',
  'choc': 'chocolate',
  'chclt': 'chocolate',
  'crsp': 'crisps',
  'crsps': 'crisps',
  'crckrs': 'crackers',
  'crckr': 'cracker',
  'ppcorn': 'popcorn',

  // Drinks
  'jce': 'juice',
  'wtr': 'water',
  'cffee': 'coffee',
  'cffe': 'coffee',
  'inst': 'instant',
  'grnd': 'ground',
  'sqsh': 'squash',
  'lmnde': 'lemonade',
  'smthie': 'smoothie',

  // Frozen
  'frzn': 'frozen',
  'frz': 'frozen',
  'fzn': 'frozen',

  // Common modifiers
  'org': 'organic',
  'orgnic': 'organic',
  'f/r': 'free range',
  'fr': 'free range',
  'frng': 'free range',
  's/s': 'semi-skimmed',
  's/skmd': 'semi-skimmed',
  'smi': 'semi',
  'skmd': 'skimmed',
  'skmmd': 'skimmed',
  'lrg': 'large',
  'lge': 'large',
  'med': 'medium',
  'sml': 'small',
  'xtra': 'extra',
  'xtr': 'extra',
  'brts': 'british',
  'brtsh': 'british',
  'lw': 'low',
  'ft': 'fat',
  'rdc': 'reduced',
  'rdcd': 'reduced',
  'lt': 'light',
  'hny': 'honey',
  'rst': 'roast',
  'rstd': 'roasted',
  'smkd': 'smoked',
  'smk': 'smoked',
  'unsmkd': 'unsmoked',
  'slcd': 'sliced',
  'slc': 'sliced',

  // Units/packaging (kept as-is but expanded)
  'pk': 'pack',
  'pkt': 'pack',
  'pkts': 'packs',
  'btl': 'bottle',
  'btls': 'bottles',
  'ctn': 'carton',
  'ctns': 'cartons',
  'bg': 'bag',
  'bgs': 'bags',
  'bx': 'box',
  'tub': 'tub',
  'pnt': 'pint',
  'pnts': 'pints',
  'ltr': 'litre',
  'ltrs': 'litres',

  // Household
  'tlt': 'toilet',
  'ktchn': 'kitchen',
  'rl': 'roll',
  'rls': 'rolls',
  'tssue': 'tissue',
  'shmpoo': 'shampoo',
  'shmpo': 'shampoo',
  'cndtnr': 'conditioner',
  'dtrgrnt': 'detergent',
  'dtrgt': 'detergent',

  // Sainsbury's SKU abbreviations
  'chdr': 'cheddar',
  'sndwch': 'sandwich',
  'sndwh': 'sandwich',
  'mrgr': 'margarine',
  'mrgrne': 'margarine',
  'sprd': 'spread',
  'crptt': 'crumpet',
  'brgr': 'burger',
  'brgrs': 'burgers',
  'nugts': 'nuggets',
  'nuggts': 'nuggets',
  'ptchd': 'poached',
  'scrmbld': 'scrambled',
  'mcrni': 'macaroni',
  'lsgn': 'lasagne',
  'bolog': 'bolognese',
  'shrbrry': 'strawberry',
  'trpcl': 'tropical',
  'mnrl': 'mineral',
  'sprklng': 'sparkling',
  'sprkl': 'sparkling',
  'flvrd': 'flavoured',
  'flvr': 'flavour',
  'ctge': 'cottage',
  'dbl': 'double',
  'sngl': 'single',
  'mld': 'mild',
  'mtre': 'mature',
  'xmtre': 'extra mature',
  'vnla': 'vanilla',
  'chry': 'cherry',
  'strwby': 'strawberry',
  'raspby': 'raspberry',
  'bbq': 'barbecue',
  'gar': 'garlic',
  'mhrm': 'mushroom',
  'mshrmm': 'mushroom',
  'tna': 'tuna',
  'swdsh': 'swordfish',
  'cddck': 'haddock',
  'hddck': 'haddock',
  'clmn': 'salmon',
  'pncrta': 'pancetta',
  'prsctt': 'prosciutto',
  'chrzio': 'chorizo',
  'chrzo': 'chorizo',
};

// Multi-word phrase abbreviations (checked before word-level)
const PHRASE_ABBREVIATIONS: Record<string, string> = {
  'chckn brst': 'chicken breast',
  'chkn brst': 'chicken breast',
  'chckn thgh': 'chicken thigh',
  'chkn thgh': 'chicken thigh',
  'bkd bns': 'baked beans',
  'chpd toms': 'chopped tomatoes',
  'chpd tmtos': 'chopped tomatoes',
  'crm chse': 'cream cheese',
  'crm frche': 'creme fraiche',
  'grn bns': 'green beans',
  'sprng onns': 'spring onions',
  'spr onns': 'spring onions',
  'swt ptto': 'sweet potato',
  'swt pttos': 'sweet potatoes',
  'ice crm': 'ice cream',
  'fsh fngrs': 'fish fingers',
  'fsh fngr': 'fish fingers',
  'grlic brd': 'garlic bread',
  'pnut bttr': 'peanut butter',
  'pnt bttr': 'peanut butter',
  'olv oil': 'olive oil',
  'olve oil': 'olive oil',
  'veg oil': 'vegetable oil',
  'snflwr oil': 'sunflower oil',
  'coc milk': 'coconut milk',
  'ccnt milk': 'coconut milk',
  'ccnt mlk': 'coconut milk',
  'oat mlk': 'oat milk',
  'almd mlk': 'almond milk',
  'soya mlk': 'soya milk',
  'org whl mlk': 'organic whole milk',
  'tlt rl': 'toilet roll',
  'tlt rls': 'toilet rolls',
  'ktchn rl': 'kitchen roll',
  'ktchn rls': 'kitchen rolls',
  'wshng lqd': 'washing liquid',
  'wshng up': 'washing up',
};

/**
 * Expand receipt abbreviations in an item name.
 * 1. Check custom user corrections (exact match)
 * 2. Strip supermarket brand prefixes (JS, HUBBARDS, etc.)
 * 3. Strip weight/size suffixes (200G, 2L, X4, etc.)
 * 4. Remove SKU jargon words (FC, NAS, CW, etc.)
 * 5. Expand phrase abbreviations
 * 6. Expand word-level abbreviations
 * 7. Title case
 */
export function expandReceiptName(
  name: string,
  customCorrections?: Record<string, string>
): string {
  const normalized = name.toLowerCase().trim();

  // 1. Check custom user corrections (exact match on full name)
  if (customCorrections?.[normalized]) {
    return customCorrections[normalized];
  }

  let expanded = normalized;

  // 2. Strip known supermarket brand prefixes
  for (const prefix of BRAND_PREFIXES) {
    if (expanded.startsWith(prefix + ' ') || expanded.startsWith(prefix + "'s ")) {
      expanded = expanded.slice(
        expanded.indexOf(' ', prefix.length - 1) + 1
      ).trim();
      break; // Only strip one prefix
    }
  }

  // 3. Strip weight/size suffixes (200G, 1.5KG, 500ML, 2L, 75CL, 1LTR, etc.)
  expanded = expanded.replace(/\b\d+(\.\d+)?\s*(kg|g|ml|l|ltr|ltrs|cl|oz|lb|pt|pnt|fl)\b/gi, '').trim();
  // Strip multipack patterns: X4, X6, X12
  expanded = expanded.replace(/\bx\s*\d+\b/gi, '').trim();
  // Strip pack sizes: 10PK, 6PCK, 4PACK
  expanded = expanded.replace(/\b\d+\s*(pk|pck|pack)\b/gi, '').trim();

  // 4. Check phrase abbreviations
  for (const [abbr, full] of Object.entries(PHRASE_ABBREVIATIONS)) {
    const regex = new RegExp(`\\b${escapeRegex(abbr)}\\b`, 'gi');
    expanded = expanded.replace(regex, full);
  }

  // 5. Apply word-level abbreviations + strip SKU jargon
  expanded = expanded
    .split(/\s+/)
    .map((word) => {
      const lower = word.toLowerCase().replace(/[^a-z/]/g, '');
      if (SKU_JARGON.has(lower)) return ''; // Strip jargon words
      return WORD_ABBREVIATIONS[lower] || word;
    })
    .filter(Boolean)
    .join(' ');

  // 6. Clean up any double spaces and trim
  expanded = expanded.replace(/\s{2,}/g, ' ').trim();

  // 7. Title case the result
  return expanded
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
