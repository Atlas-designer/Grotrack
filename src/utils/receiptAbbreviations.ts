// Built-in dictionary of common UK receipt abbreviations
// Maps lowercase abbreviated forms to their expanded versions
// Includes both word-level abbreviations and multi-word shortcuts

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
 * Checks custom user corrections first, then built-in phrase abbreviations,
 * then word-level abbreviations.
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

  // 2. Check phrase abbreviations
  for (const [abbr, full] of Object.entries(PHRASE_ABBREVIATIONS)) {
    const regex = new RegExp(`\\b${escapeRegex(abbr)}\\b`, 'gi');
    expanded = expanded.replace(regex, full);
  }

  // 3. Apply word-level abbreviations
  expanded = expanded
    .split(/\s+/)
    .map((word) => {
      const lower = word.toLowerCase().replace(/[^a-z/]/g, '');
      return WORD_ABBREVIATIONS[lower] || word;
    })
    .join(' ');

  // 4. Title case the result
  return expanded
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
