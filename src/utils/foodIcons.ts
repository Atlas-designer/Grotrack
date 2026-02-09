import { FoodCategory } from '../types';

// Specific food keyword → emoji mappings
// Checked longest-first via SORTED_ICON_KEYWORDS
const FOOD_ICONS: { keywords: string[]; emoji: string }[] = [
  // Poultry
  { keywords: ['chicken', 'chick'], emoji: '🍗' },
  { keywords: ['turkey'], emoji: '🦃' },
  { keywords: ['duck'], emoji: '🦆' },
  { keywords: ['egg', 'eggs'], emoji: '🥚' },

  // Meat
  { keywords: ['beef', 'steak'], emoji: '🥩' },
  { keywords: ['pork', 'ham', 'bacon', 'gammon'], emoji: '🥓' },
  { keywords: ['lamb'], emoji: '🍖' },
  { keywords: ['sausage', 'banger', 'hotdog'], emoji: '🌭' },
  { keywords: ['mince', 'ground'], emoji: '🥩' },
  { keywords: ['burger', 'patty', 'patties'], emoji: '🍔' },

  // Fish & Seafood
  { keywords: ['salmon'], emoji: '🐟' },
  { keywords: ['tuna'], emoji: '🐟' },
  { keywords: ['cod', 'haddock', 'pollock', 'fish finger', 'fish'], emoji: '🐟' },
  { keywords: ['prawn', 'shrimp'], emoji: '🦐' },
  { keywords: ['crab'], emoji: '🦀' },

  // Dairy
  { keywords: ['milk', 'mlk'], emoji: '🥛' },
  { keywords: ['cheese', 'cheddar', 'mozzarella', 'parmesan', 'brie', 'gouda'], emoji: '🧀' },
  { keywords: ['yoghurt', 'yogurt'], emoji: '🥛' },
  { keywords: ['butter'], emoji: '🧈' },
  { keywords: ['cream'], emoji: '🥛' },
  { keywords: ['ice cream', 'icecream'], emoji: '🍦' },

  // Bread & Bakery
  { keywords: ['bread', 'loaf'], emoji: '🍞' },
  { keywords: ['toast'], emoji: '🍞' },
  { keywords: ['bagel'], emoji: '🥯' },
  { keywords: ['croissant'], emoji: '🥐' },
  { keywords: ['cake'], emoji: '🎂' },
  { keywords: ['muffin', 'cupcake'], emoji: '🧁' },
  { keywords: ['cookie', 'biscuit', 'bisc'], emoji: '🍪' },
  { keywords: ['donut', 'doughnut'], emoji: '🍩' },
  { keywords: ['pancake', 'waffle'], emoji: '🧇' },
  { keywords: ['wrap', 'tortilla', 'pitta', 'pita', 'naan'], emoji: '🫓' },
  { keywords: ['roll', 'bun', 'bap'], emoji: '🍞' },
  { keywords: ['crumpet'], emoji: '🧇' },

  // Fruits
  { keywords: ['apple'], emoji: '🍎' },
  { keywords: ['banana'], emoji: '🍌' },
  { keywords: ['orange'], emoji: '🍊' },
  { keywords: ['lemon'], emoji: '🍋' },
  { keywords: ['lime'], emoji: '🍋' },
  { keywords: ['grape', 'grapes'], emoji: '🍇' },
  { keywords: ['strawberry', 'strawberries'], emoji: '🍓' },
  { keywords: ['blueberry', 'blueberries'], emoji: '🫐' },
  { keywords: ['raspberry', 'raspberries'], emoji: '🫐' },
  { keywords: ['watermelon'], emoji: '🍉' },
  { keywords: ['melon'], emoji: '🍈' },
  { keywords: ['peach', 'nectarine'], emoji: '🍑' },
  { keywords: ['pear'], emoji: '🍐' },
  { keywords: ['cherry', 'cherries'], emoji: '🍒' },
  { keywords: ['mango'], emoji: '🥭' },
  { keywords: ['pineapple'], emoji: '🍍' },
  { keywords: ['kiwi'], emoji: '🥝' },
  { keywords: ['coconut'], emoji: '🥥' },
  { keywords: ['avocado'], emoji: '🥑' },
  { keywords: ['tomato'], emoji: '🍅' },

  // Vegetables
  { keywords: ['potato', 'spud', 'chips', 'fries'], emoji: '🥔' },
  { keywords: ['carrot'], emoji: '🥕' },
  { keywords: ['broccoli'], emoji: '🥦' },
  { keywords: ['sweetcorn', 'corn'], emoji: '🌽' },
  { keywords: ['pepper', 'capsicum'], emoji: '🫑' },
  { keywords: ['chilli', 'chili', 'jalapeno'], emoji: '🌶️' },
  { keywords: ['onion'], emoji: '🧅' },
  { keywords: ['garlic'], emoji: '🧄' },
  { keywords: ['mushroom'], emoji: '🍄' },
  { keywords: ['lettuce', 'salad'], emoji: '🥬' },
  { keywords: ['cucumber'], emoji: '🥒' },
  { keywords: ['aubergine', 'eggplant'], emoji: '🍆' },
  { keywords: ['pea', 'peas'], emoji: '🫛' },
  { keywords: ['bean', 'beans'], emoji: '🫘' },
  { keywords: ['spinach', 'kale'], emoji: '🥬' },
  { keywords: ['cabbage'], emoji: '🥬' },
  { keywords: ['celery'], emoji: '🥬' },
  { keywords: ['ginger'], emoji: '🫚' },

  // Drinks - Specific brands / types
  { keywords: ['pepsi'], emoji: '🥤' },
  { keywords: ['coca cola', 'coca-cola', 'coke'], emoji: '🥤' },
  { keywords: ['fanta'], emoji: '🧃' },
  { keywords: ['sprite', '7up', '7-up'], emoji: '🥤' },
  { keywords: ['tango'], emoji: '🧃' },
  { keywords: ['lucozade'], emoji: '🧃' },
  { keywords: ['ribena'], emoji: '🧃' },
  { keywords: ['irn bru', 'irn-bru'], emoji: '🥤' },
  { keywords: ['dr pepper', 'dr. pepper'], emoji: '🥤' },
  { keywords: ['red bull', 'monster', 'energy'], emoji: '⚡' },
  { keywords: ['beer', 'lager', 'ale'], emoji: '🍺' },
  { keywords: ['wine'], emoji: '🍷' },
  { keywords: ['vodka', 'gin', 'rum', 'whisky', 'whiskey'], emoji: '🥃' },
  { keywords: ['coffee'], emoji: '☕' },
  { keywords: ['tea'], emoji: '🫖' },
  { keywords: ['juice', 'squash', 'cordial'], emoji: '🧃' },
  { keywords: ['water'], emoji: '💧' },
  { keywords: ['smoothie'], emoji: '🥤' },
  { keywords: ['cola', 'pop', 'soda', 'fizzy'], emoji: '🥤' },
  { keywords: ['milkshake'], emoji: '🥛' },

  // Prepared / Meals
  { keywords: ['pizza'], emoji: '🍕' },
  { keywords: ['pasta', 'spaghetti', 'penne', 'fusilli', 'macaroni'], emoji: '🍝' },
  { keywords: ['noodle', 'ramen'], emoji: '🍜' },
  { keywords: ['rice'], emoji: '🍚' },
  { keywords: ['curry'], emoji: '🍛' },
  { keywords: ['soup'], emoji: '🍲' },
  { keywords: ['pie'], emoji: '🥧' },
  { keywords: ['sandwich'], emoji: '🥪' },
  { keywords: ['taco'], emoji: '🌮' },
  { keywords: ['burrito'], emoji: '🌯' },
  { keywords: ['sushi'], emoji: '🍣' },

  // Condiments & Pantry
  { keywords: ['ketchup', 'tomato sauce'], emoji: '🍅' },
  { keywords: ['mayo', 'mayonnaise'], emoji: '🫙' },
  { keywords: ['mustard'], emoji: '🫙' },
  { keywords: ['vinegar'], emoji: '🫙' },
  { keywords: ['oil', 'olive oil'], emoji: '🫒' },
  { keywords: ['sauce', 'dressing'], emoji: '🫙' },
  { keywords: ['honey'], emoji: '🍯' },
  { keywords: ['jam', 'marmalade', 'preserve'], emoji: '🫙' },
  { keywords: ['peanut butter', 'nutella'], emoji: '🥜' },
  { keywords: ['salt'], emoji: '🧂' },
  { keywords: ['sugar'], emoji: '🧂' },
  { keywords: ['flour'], emoji: '🌾' },
  { keywords: ['cereal', 'granola', 'oats', 'porridge'], emoji: '🥣' },

  // Snacks
  { keywords: ['crisps', 'chips', 'doritos', 'pringles', 'walkers'], emoji: '🥨' },
  { keywords: ['chocolate', 'choc'], emoji: '🍫' },
  { keywords: ['sweet', 'candy', 'haribo', 'gummy'], emoji: '🍬' },
  { keywords: ['popcorn'], emoji: '🍿' },
  { keywords: ['nut', 'nuts', 'peanut', 'almond', 'cashew'], emoji: '🥜' },

  // Canned
  { keywords: ['tin', 'can', 'canned', 'tinned'], emoji: '🥫' },

  // Frozen
  { keywords: ['frozen'], emoji: '🧊' },
];

// Pre-sort: longest keyword first for specificity
const SORTED_ICON_KEYWORDS = FOOD_ICONS.flatMap((entry) =>
  entry.keywords.map((kw) => ({ keyword: kw, emoji: entry.emoji }))
).sort((a, b) => b.keyword.length - a.keyword.length);

// Category fallback emojis
const CATEGORY_ICONS: Record<FoodCategory, string> = {
  dairy: '🥛',
  meat: '🥩',
  produce: '🥬',
  frozen: '🧊',
  canned: '🥫',
  'dry-goods': '🌾',
  snacks: '🍿',
  beverages: '🥤',
  condiments: '🫙',
  other: '📦',
};

/**
 * Get an emoji icon for a food item based on its name.
 * Falls back to category icon, then generic package icon.
 */
export function getFoodIcon(name: string, category?: FoodCategory): string {
  const normalized = name.toLowerCase().trim();

  // Check specific keywords (longest match first)
  for (const { keyword, emoji } of SORTED_ICON_KEYWORDS) {
    if (normalized.includes(keyword)) {
      return emoji;
    }
  }

  // Fall back to category icon
  if (category && CATEGORY_ICONS[category]) {
    return CATEGORY_ICONS[category];
  }

  return '📦';
}
