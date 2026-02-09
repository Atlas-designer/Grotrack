import { UnitType } from '../types';

/**
 * Guesses the most appropriate unit for a food item based on its name.
 * Used by the recipe creator and receipt scanner for smart defaults.
 */
export function guessUnit(name: string): UnitType {
  const n = name.toLowerCase().trim();
  if (!n) return 'pieces';

  // Liquids → ml
  const liquids = [
    'milk', 'cream', 'water', 'stock', 'broth', 'juice', 'wine', 'beer',
    'vinegar', 'oil', 'olive oil', 'vegetable oil', 'sunflower oil',
    'soy sauce', 'worcestershire', 'hot sauce', 'sriracha', 'ketchup',
    'passata', 'coconut milk', 'yoghurt', 'yogurt', 'honey', 'syrup',
    'maple syrup', 'lemon juice', 'lime juice',
  ];
  if (liquids.some((l) => n === l || n.startsWith(l + ' ') || n.endsWith(' ' + l))) return 'ml';
  if (n.includes('sauce') || n.includes('stock') || n.includes('broth') || n.includes('juice')) return 'ml';

  // Discrete / countable items → pieces
  const pieces = [
    'egg', 'eggs', 'onion', 'onions', 'clove', 'cloves', 'garlic clove',
    'tortilla', 'tortillas', 'wrap', 'wraps', 'roll', 'rolls', 'bun', 'buns',
    'slice', 'slices', 'rasher', 'rashers', 'sausage', 'sausages',
    'potato', 'potatoes', 'tomato', 'tomatoes', 'pepper', 'peppers',
    'bell pepper', 'chilli', 'chillies', 'avocado', 'avocados',
    'banana', 'bananas', 'apple', 'apples', 'lemon', 'lemons', 'lime', 'limes',
    'carrot', 'carrots', 'courgette', 'courgettes', 'aubergine', 'aubergines',
    'mushroom', 'mushrooms', 'spring onion', 'spring onions',
    'bread', 'pitta', 'pittas', 'naan', 'crumpet', 'crumpets',
    'burger bun', 'hot dog bun', 'bagel', 'bagels',
    'crisp', 'crisps', 'chip', 'chips', 'biscuit', 'biscuits',
    'sweet', 'sweets', 'chocolate bar',
  ];
  if (pieces.some((p) => n === p)) return 'pieces';
  if (n.includes('crisp') || n.includes('chip') || n.includes('snack')) return 'pieces';

  // Pack items
  const packs = [
    'noodles', 'instant noodles', 'ramen', 'puff pastry', 'filo pastry',
    'shortcrust pastry', 'pasta sheets', 'lasagne sheets',
  ];
  if (packs.some((p) => n === p)) return 'pack';

  // Weight-based items → g (meats, dairy solids, baking, grains, etc.)
  const grams = [
    'chicken', 'beef', 'pork', 'lamb', 'mince', 'steak', 'bacon',
    'ham', 'turkey', 'duck', 'salmon', 'cod', 'tuna', 'prawns', 'fish',
    'butter', 'cheese', 'cheddar', 'mozzarella', 'parmesan', 'cream cheese',
    'flour', 'sugar', 'rice', 'pasta', 'spaghetti', 'penne', 'fusilli',
    'oats', 'breadcrumbs', 'lentils', 'chickpeas', 'beans',
    'spinach', 'kale', 'broccoli', 'cauliflower', 'cabbage', 'lettuce',
    'peas', 'sweetcorn', 'corn', 'mixed veg',
  ];
  if (grams.some((g) => n === g || n.startsWith(g + ' ') || n.endsWith(' ' + g))) return 'g';
  if (n.includes('chicken') || n.includes('beef') || n.includes('pork') || n.includes('lamb')
    || n.includes('mince') || n.includes('fish') || n.includes('prawn')) return 'g';
  if (n.includes('flour') || n.includes('sugar') || n.includes('butter') || n.includes('cheese')
    || n.includes('rice') || n.includes('pasta') || n.includes('oat')) return 'g';

  return 'pieces';
}
