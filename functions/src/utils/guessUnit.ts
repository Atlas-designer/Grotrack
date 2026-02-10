type UnitType = 'pieces' | 'kg' | 'g' | 'L' | 'ml' | 'pack';

/**
 * Server-side copy of guessUnit for Alexa AddItemIntent.
 */
export function guessUnit(name: string): UnitType {
  const n = name.toLowerCase().trim();
  if (!n) return 'pieces';

  const liquids = [
    'milk', 'cream', 'water', 'stock', 'broth', 'juice', 'wine', 'beer',
    'vinegar', 'oil', 'olive oil', 'vegetable oil', 'sunflower oil',
    'soy sauce', 'worcestershire', 'hot sauce', 'sriracha', 'ketchup',
    'passata', 'coconut milk', 'yoghurt', 'yogurt', 'honey', 'syrup',
  ];
  if (liquids.some((l) => n === l || n.startsWith(l + ' ') || n.endsWith(' ' + l))) return 'ml';
  if (n.includes('sauce') || n.includes('stock') || n.includes('broth') || n.includes('juice')) return 'ml';

  const pieces = [
    'egg', 'eggs', 'onion', 'onions', 'tortilla', 'tortillas', 'wrap', 'wraps',
    'sausage', 'sausages', 'potato', 'potatoes', 'tomato', 'tomatoes',
    'pepper', 'peppers', 'banana', 'bananas', 'apple', 'apples',
    'carrot', 'carrots', 'lemon', 'lemons', 'lime', 'limes',
    'mushroom', 'mushrooms', 'avocado', 'avocados',
    'bread', 'pitta', 'naan', 'bagel', 'bagels',
    'crisp', 'crisps', 'biscuit', 'biscuits',
  ];
  if (pieces.some((p) => n === p)) return 'pieces';
  if (n.includes('crisp') || n.includes('chip') || n.includes('snack')) return 'pieces';

  const packs = ['noodles', 'instant noodles', 'ramen', 'puff pastry', 'filo pastry'];
  if (packs.some((p) => n === p)) return 'pack';

  const grams = [
    'chicken', 'beef', 'pork', 'lamb', 'mince', 'steak', 'bacon',
    'ham', 'turkey', 'salmon', 'cod', 'tuna', 'prawns', 'fish',
    'butter', 'cheese', 'cheddar', 'mozzarella', 'parmesan',
    'flour', 'sugar', 'rice', 'pasta', 'spaghetti', 'oats',
    'spinach', 'broccoli', 'cauliflower', 'peas', 'sweetcorn',
  ];
  if (grams.some((g) => n === g || n.startsWith(g + ' ') || n.endsWith(' ' + g))) return 'g';
  if (n.includes('chicken') || n.includes('beef') || n.includes('pork') || n.includes('lamb')
    || n.includes('mince') || n.includes('fish') || n.includes('prawn')) return 'g';
  if (n.includes('flour') || n.includes('sugar') || n.includes('butter') || n.includes('cheese')
    || n.includes('rice') || n.includes('pasta') || n.includes('oat')) return 'g';

  return 'pieces';
}
