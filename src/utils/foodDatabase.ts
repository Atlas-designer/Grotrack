import { FoodInfo } from '../types';

export type { FoodInfo };

interface FoodEntry {
  keywords: string[];
  info: FoodInfo;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const FOOD_DATABASE: FoodEntry[] = [
  // ═══════════════════════════════════════
  // DAIRY (fridge)
  // ═══════════════════════════════════════
  { keywords: ['whole milk', 'semi skimmed', 'skimmed milk', 'semi-skimmed', 'full fat milk'], info: { category: 'dairy', compartment: 'fridge', expiryDays: 7 } },
  { keywords: ['milk'], info: { category: 'dairy', compartment: 'fridge', expiryDays: 7 } },
  { keywords: ['oat milk', 'almond milk', 'soy milk', 'soya milk', 'coconut milk', 'rice milk', 'oat drink'], info: { category: 'beverages', compartment: 'fridge', expiryDays: 10 } },
  { keywords: ['cheddar', 'mozzarella', 'parmesan', 'brie', 'camembert', 'gouda', 'gruyere', 'stilton', 'feta', 'halloumi', 'red leicester', 'wensleydale', 'emmental', 'edam'], info: { category: 'dairy', compartment: 'fridge', expiryDays: 21 } },
  { keywords: ['cream cheese', 'philadelphia', 'soft cheese'], info: { category: 'dairy', compartment: 'fridge', expiryDays: 14 } },
  { keywords: ['cottage cheese'], info: { category: 'dairy', compartment: 'fridge', expiryDays: 7 } },
  { keywords: ['cheese'], info: { category: 'dairy', compartment: 'fridge', expiryDays: 14 } },
  { keywords: ['yoghurt', 'yogurt', 'greek yoghurt', 'greek yogurt', 'activia', 'muller'], info: { category: 'dairy', compartment: 'fridge', expiryDays: 14 } },
  { keywords: ['butter', 'lurpak', 'anchor butter', 'country life'], info: { category: 'dairy', compartment: 'fridge', expiryDays: 30 } },
  { keywords: ['double cream', 'single cream', 'whipping cream', 'clotted cream', 'pouring cream'], info: { category: 'dairy', compartment: 'fridge', expiryDays: 7 } },
  { keywords: ['sour cream', 'creme fraiche', 'crème fraîche', 'soured cream'], info: { category: 'dairy', compartment: 'fridge', expiryDays: 14 } },
  { keywords: ['cream'], info: { category: 'dairy', compartment: 'fridge', expiryDays: 7 } },
  { keywords: ['eggs', 'egg', 'free range eggs', 'large eggs', 'medium eggs'], info: { category: 'dairy', compartment: 'fridge', expiryDays: 21 } },
  { keywords: ['margarine', 'flora', 'stork', 'spread'], info: { category: 'dairy', compartment: 'fridge', expiryDays: 60 } },

  // ═══════════════════════════════════════
  // MEAT (fridge)
  // ═══════════════════════════════════════
  { keywords: ['chicken breast', 'chicken thigh', 'chicken drumstick', 'chicken wing', 'chicken leg', 'chicken fillet'], info: { category: 'meat', compartment: 'fridge', expiryDays: 2 } },
  { keywords: ['whole chicken', 'roasting chicken'], info: { category: 'meat', compartment: 'fridge', expiryDays: 2 } },
  { keywords: ['chicken'], info: { category: 'meat', compartment: 'fridge', expiryDays: 2 } },
  { keywords: ['beef mince', 'minced beef', 'ground beef', 'lean mince'], info: { category: 'meat', compartment: 'fridge', expiryDays: 2 } },
  { keywords: ['beef steak', 'sirloin', 'ribeye', 'rib eye', 'fillet steak', 'rump steak', 'bavette', 'flank steak'], info: { category: 'meat', compartment: 'fridge', expiryDays: 4 } },
  { keywords: ['beef joint', 'topside', 'brisket', 'silverside', 'braising steak', 'stewing beef'], info: { category: 'meat', compartment: 'fridge', expiryDays: 3 } },
  { keywords: ['beef'], info: { category: 'meat', compartment: 'fridge', expiryDays: 4 } },
  { keywords: ['pork chop', 'pork loin', 'pork belly', 'pork shoulder', 'pork fillet', 'pork tenderloin'], info: { category: 'meat', compartment: 'fridge', expiryDays: 4 } },
  { keywords: ['pork mince', 'minced pork'], info: { category: 'meat', compartment: 'fridge', expiryDays: 2 } },
  { keywords: ['pork'], info: { category: 'meat', compartment: 'fridge', expiryDays: 4 } },
  { keywords: ['lamb chop', 'lamb leg', 'lamb shoulder', 'lamb mince', 'lamb shank', 'rack of lamb'], info: { category: 'meat', compartment: 'fridge', expiryDays: 3 } },
  { keywords: ['lamb'], info: { category: 'meat', compartment: 'fridge', expiryDays: 3 } },
  { keywords: ['mince', 'minced'], info: { category: 'meat', compartment: 'fridge', expiryDays: 2 } },
  { keywords: ['sausage', 'sausages', 'banger', 'chipolata', 'cumberland', 'bratwurst'], info: { category: 'meat', compartment: 'fridge', expiryDays: 3 } },
  { keywords: ['bacon', 'back bacon', 'streaky bacon', 'smoked bacon', 'unsmoked bacon', 'pancetta'], info: { category: 'meat', compartment: 'fridge', expiryDays: 7 } },
  { keywords: ['turkey breast', 'turkey mince', 'turkey steak'], info: { category: 'meat', compartment: 'fridge', expiryDays: 2 } },
  { keywords: ['turkey'], info: { category: 'meat', compartment: 'fridge', expiryDays: 2 } },
  { keywords: ['ham', 'gammon', 'parma ham', 'cooked ham', 'honey roast ham'], info: { category: 'meat', compartment: 'fridge', expiryDays: 5 } },
  { keywords: ['steak'], info: { category: 'meat', compartment: 'fridge', expiryDays: 4 } },
  { keywords: ['salami', 'chorizo', 'pepperoni', 'prosciutto', 'bresaola', 'nduja'], info: { category: 'meat', compartment: 'fridge', expiryDays: 21 } },
  { keywords: ['duck breast', 'duck leg', 'duck'], info: { category: 'meat', compartment: 'fridge', expiryDays: 2 } },
  { keywords: ['venison'], info: { category: 'meat', compartment: 'fridge', expiryDays: 3 } },

  // ═══════════════════════════════════════
  // FISH & SEAFOOD (fridge)
  // ═══════════════════════════════════════
  { keywords: ['smoked salmon', 'smoked trout', 'smoked mackerel', 'kipper'], info: { category: 'meat', compartment: 'fridge', expiryDays: 5 } },
  { keywords: ['salmon', 'salmon fillet'], info: { category: 'meat', compartment: 'fridge', expiryDays: 2 } },
  { keywords: ['cod', 'cod fillet', 'cod loin'], info: { category: 'meat', compartment: 'fridge', expiryDays: 2 } },
  { keywords: ['haddock'], info: { category: 'meat', compartment: 'fridge', expiryDays: 2 } },
  { keywords: ['sea bass', 'seabass'], info: { category: 'meat', compartment: 'fridge', expiryDays: 2 } },
  { keywords: ['tuna steak', 'fresh tuna'], info: { category: 'meat', compartment: 'fridge', expiryDays: 2 } },
  { keywords: ['prawns', 'shrimp', 'king prawns', 'tiger prawns', 'cooked prawns'], info: { category: 'meat', compartment: 'fridge', expiryDays: 2 } },
  { keywords: ['mackerel', 'sardine', 'sardines', 'anchovy', 'anchovies'], info: { category: 'meat', compartment: 'fridge', expiryDays: 2 } },
  { keywords: ['trout'], info: { category: 'meat', compartment: 'fridge', expiryDays: 2 } },
  { keywords: ['fish fillet', 'fish finger', 'fish cake', 'fish pie'], info: { category: 'meat', compartment: 'fridge', expiryDays: 2 } },
  { keywords: ['squid', 'calamari', 'mussels', 'clams', 'scallop', 'scallops', 'crab', 'lobster'], info: { category: 'meat', compartment: 'fridge', expiryDays: 2 } },

  // ═══════════════════════════════════════
  // PRODUCE - FRUIT
  // ═══════════════════════════════════════
  { keywords: ['strawberry', 'strawberries'], info: { category: 'produce', compartment: 'fridge', expiryDays: 5 } },
  { keywords: ['blueberry', 'blueberries'], info: { category: 'produce', compartment: 'fridge', expiryDays: 7 } },
  { keywords: ['raspberry', 'raspberries'], info: { category: 'produce', compartment: 'fridge', expiryDays: 3 } },
  { keywords: ['blackberry', 'blackberries'], info: { category: 'produce', compartment: 'fridge', expiryDays: 3 } },
  { keywords: ['mixed berries', 'berry', 'berries'], info: { category: 'produce', compartment: 'fridge', expiryDays: 5 } },
  { keywords: ['apple', 'apples', 'gala apple', 'braeburn', 'granny smith', 'pink lady', 'jazz apple', 'royal gala'], info: { category: 'produce', compartment: 'fridge', expiryDays: 21 } },
  { keywords: ['banana', 'bananas'], info: { category: 'produce', compartment: 'pantry', expiryDays: 5 } },
  { keywords: ['orange', 'oranges', 'satsuma', 'satsumas', 'clementine', 'clementines', 'tangerine', 'mandarin'], info: { category: 'produce', compartment: 'fridge', expiryDays: 14 } },
  { keywords: ['grape', 'grapes'], info: { category: 'produce', compartment: 'fridge', expiryDays: 7 } },
  { keywords: ['avocado', 'avocados'], info: { category: 'produce', compartment: 'fridge', expiryDays: 5 } },
  { keywords: ['melon', 'watermelon', 'honeydew', 'cantaloupe', 'galia'], info: { category: 'produce', compartment: 'fridge', expiryDays: 5 } },
  { keywords: ['pear', 'pears', 'conference pear'], info: { category: 'produce', compartment: 'fridge', expiryDays: 7 } },
  { keywords: ['mango', 'mangoes'], info: { category: 'produce', compartment: 'fridge', expiryDays: 5 } },
  { keywords: ['pineapple'], info: { category: 'produce', compartment: 'fridge', expiryDays: 5 } },
  { keywords: ['kiwi', 'kiwis', 'kiwi fruit'], info: { category: 'produce', compartment: 'fridge', expiryDays: 7 } },
  { keywords: ['peach', 'peaches', 'nectarine', 'nectarines'], info: { category: 'produce', compartment: 'fridge', expiryDays: 5 } },
  { keywords: ['plum', 'plums'], info: { category: 'produce', compartment: 'fridge', expiryDays: 5 } },
  { keywords: ['cherry', 'cherries'], info: { category: 'produce', compartment: 'fridge', expiryDays: 5 } },
  { keywords: ['lemon', 'lemons', 'lime', 'limes'], info: { category: 'produce', compartment: 'fridge', expiryDays: 21 } },
  { keywords: ['pomegranate'], info: { category: 'produce', compartment: 'fridge', expiryDays: 14 } },
  { keywords: ['fig', 'figs'], info: { category: 'produce', compartment: 'fridge', expiryDays: 3 } },
  { keywords: ['passion fruit', 'passionfruit'], info: { category: 'produce', compartment: 'fridge', expiryDays: 7 } },
  { keywords: ['coconut'], info: { category: 'produce', compartment: 'pantry', expiryDays: 14 } },

  // ═══════════════════════════════════════
  // PRODUCE - VEGETABLES
  // ═══════════════════════════════════════
  { keywords: ['lettuce', 'salad', 'rocket', 'mixed leaves', 'baby leaf', 'watercress', 'lamb lettuce', 'iceberg', 'romaine', 'little gem'], info: { category: 'produce', compartment: 'fridge', expiryDays: 5 } },
  { keywords: ['baby spinach', 'spinach'], info: { category: 'produce', compartment: 'fridge', expiryDays: 5 } },
  { keywords: ['cherry tomato', 'cherry tomatoes', 'vine tomatoes'], info: { category: 'produce', compartment: 'fridge', expiryDays: 7 } },
  { keywords: ['tomato', 'tomatoes'], info: { category: 'produce', compartment: 'fridge', expiryDays: 7 } },
  { keywords: ['cucumber'], info: { category: 'produce', compartment: 'fridge', expiryDays: 7 } },
  { keywords: ['bell pepper', 'capsicum', 'sweet pepper'], info: { category: 'produce', compartment: 'fridge', expiryDays: 7 } },
  { keywords: ['pepper', 'peppers', 'mixed peppers', 'red pepper', 'green pepper', 'yellow pepper'], info: { category: 'produce', compartment: 'fridge', expiryDays: 7 } },
  { keywords: ['carrot', 'carrots', 'baby carrot'], info: { category: 'produce', compartment: 'fridge', expiryDays: 21 } },
  { keywords: ['broccoli', 'tenderstem', 'purple sprouting'], info: { category: 'produce', compartment: 'fridge', expiryDays: 5 } },
  { keywords: ['cauliflower'], info: { category: 'produce', compartment: 'fridge', expiryDays: 7 } },
  { keywords: ['mushroom', 'mushrooms', 'chestnut mushroom', 'portobello', 'button mushroom'], info: { category: 'produce', compartment: 'fridge', expiryDays: 5 } },
  { keywords: ['courgette', 'zucchini'], info: { category: 'produce', compartment: 'fridge', expiryDays: 7 } },
  { keywords: ['aubergine', 'eggplant'], info: { category: 'produce', compartment: 'fridge', expiryDays: 7 } },
  { keywords: ['green bean', 'green beans', 'runner bean', 'runner beans', 'french bean', 'french beans', 'fine beans'], info: { category: 'produce', compartment: 'fridge', expiryDays: 5 } },
  { keywords: ['mangetout', 'sugar snap', 'sugar snaps', 'snap peas'], info: { category: 'produce', compartment: 'fridge', expiryDays: 5 } },
  { keywords: ['sweetcorn', 'corn on the cob', 'baby corn'], info: { category: 'produce', compartment: 'fridge', expiryDays: 5 } },
  { keywords: ['celery'], info: { category: 'produce', compartment: 'fridge', expiryDays: 14 } },
  { keywords: ['spring onion', 'spring onions', 'scallion', 'scallions'], info: { category: 'produce', compartment: 'fridge', expiryDays: 7 } },
  { keywords: ['leek', 'leeks'], info: { category: 'produce', compartment: 'fridge', expiryDays: 10 } },
  { keywords: ['cabbage', 'red cabbage', 'savoy cabbage', 'white cabbage'], info: { category: 'produce', compartment: 'fridge', expiryDays: 14 } },
  { keywords: ['kale', 'cavolo nero'], info: { category: 'produce', compartment: 'fridge', expiryDays: 5 } },
  { keywords: ['asparagus'], info: { category: 'produce', compartment: 'fridge', expiryDays: 4 } },
  { keywords: ['peas', 'garden peas', 'petit pois'], info: { category: 'produce', compartment: 'fridge', expiryDays: 5 } },
  { keywords: ['beetroot', 'beet'], info: { category: 'produce', compartment: 'fridge', expiryDays: 14 } },
  { keywords: ['radish', 'radishes'], info: { category: 'produce', compartment: 'fridge', expiryDays: 7 } },
  { keywords: ['pak choi', 'bok choy', 'bok choi'], info: { category: 'produce', compartment: 'fridge', expiryDays: 5 } },
  { keywords: ['parsnip', 'parsnips'], info: { category: 'produce', compartment: 'fridge', expiryDays: 14 } },
  { keywords: ['turnip', 'swede'], info: { category: 'produce', compartment: 'fridge', expiryDays: 14 } },
  { keywords: ['butternut squash', 'squash', 'pumpkin'], info: { category: 'produce', compartment: 'pantry', expiryDays: 30 } },
  // Room-temp veg
  { keywords: ['onion', 'onions', 'red onion', 'white onion', 'brown onion', 'shallot', 'shallots'], info: { category: 'produce', compartment: 'pantry', expiryDays: 30 } },
  { keywords: ['potato', 'potatoes', 'new potato', 'new potatoes', 'baby potato', 'baby potatoes', 'king edward', 'maris piper', 'jersey royal'], info: { category: 'produce', compartment: 'pantry', expiryDays: 21 } },
  { keywords: ['sweet potato', 'sweet potatoes', 'yam'], info: { category: 'produce', compartment: 'pantry', expiryDays: 14 } },
  { keywords: ['garlic', 'garlic bulb'], info: { category: 'produce', compartment: 'pantry', expiryDays: 30 } },
  { keywords: ['ginger', 'root ginger'], info: { category: 'produce', compartment: 'fridge', expiryDays: 21 } },
  { keywords: ['chilli', 'chillies', 'chili', 'jalapeño', 'jalapeno'], info: { category: 'produce', compartment: 'fridge', expiryDays: 7 } },
  { keywords: ['fresh herbs', 'basil', 'coriander', 'parsley', 'mint', 'dill', 'chives', 'thyme', 'rosemary', 'sage'], info: { category: 'produce', compartment: 'fridge', expiryDays: 7 } },

  // ═══════════════════════════════════════
  // BREAD & BAKERY (pantry)
  // ═══════════════════════════════════════
  { keywords: ['sliced bread', 'white bread', 'wholemeal bread', 'brown bread', 'sourdough', 'seeded bread', 'kingsmill', 'warburtons', 'hovis'], info: { category: 'dry-goods', compartment: 'pantry', expiryDays: 5 } },
  { keywords: ['bread', 'loaf'], info: { category: 'dry-goods', compartment: 'pantry', expiryDays: 5 } },
  { keywords: ['roll', 'rolls', 'bread roll', 'bread rolls', 'bun', 'buns', 'brioche', 'ciabatta', 'focaccia'], info: { category: 'dry-goods', compartment: 'pantry', expiryDays: 3 } },
  { keywords: ['wrap', 'wraps', 'tortilla', 'tortillas', 'pitta', 'pita', 'naan', 'flatbread', 'chapati'], info: { category: 'dry-goods', compartment: 'pantry', expiryDays: 7 } },
  { keywords: ['bagel', 'bagels'], info: { category: 'dry-goods', compartment: 'pantry', expiryDays: 5 } },
  { keywords: ['crumpet', 'crumpets'], info: { category: 'dry-goods', compartment: 'pantry', expiryDays: 5 } },
  { keywords: ['english muffin', 'english muffins'], info: { category: 'dry-goods', compartment: 'pantry', expiryDays: 5 } },
  { keywords: ['croissant', 'croissants', 'pain au chocolat', 'danish pastry'], info: { category: 'dry-goods', compartment: 'pantry', expiryDays: 3 } },
  { keywords: ['scone', 'scones'], info: { category: 'dry-goods', compartment: 'pantry', expiryDays: 3 } },
  { keywords: ['pancake', 'pancakes'], info: { category: 'dry-goods', compartment: 'fridge', expiryDays: 5 } },

  // ═══════════════════════════════════════
  // PANTRY STAPLES & DRY GOODS
  // ═══════════════════════════════════════
  { keywords: ['basmati', 'jasmine rice', 'long grain', 'arborio', 'risotto rice', 'wild rice', 'brown rice', 'sushi rice', 'pilau rice'], info: { category: 'dry-goods', compartment: 'pantry', expiryDays: 365 } },
  { keywords: ['rice'], info: { category: 'dry-goods', compartment: 'pantry', expiryDays: 365 } },
  { keywords: ['spaghetti', 'penne', 'fusilli', 'macaroni', 'tagliatelle', 'linguine', 'farfalle', 'rigatoni', 'orzo', 'conchiglie', 'lasagne sheets'], info: { category: 'dry-goods', compartment: 'pantry', expiryDays: 365 } },
  { keywords: ['pasta'], info: { category: 'dry-goods', compartment: 'pantry', expiryDays: 365 } },
  { keywords: ['noodle', 'noodles', 'egg noodle', 'rice noodle', 'udon', 'ramen', 'vermicelli'], info: { category: 'dry-goods', compartment: 'pantry', expiryDays: 365 } },
  { keywords: ['couscous', 'bulgur', 'quinoa', 'pearl barley'], info: { category: 'dry-goods', compartment: 'pantry', expiryDays: 365 } },
  { keywords: ['plain flour', 'self raising', 'self-raising', 'bread flour', 'strong flour', 'cornflour'], info: { category: 'dry-goods', compartment: 'pantry', expiryDays: 180 } },
  { keywords: ['flour'], info: { category: 'dry-goods', compartment: 'pantry', expiryDays: 180 } },
  { keywords: ['caster sugar', 'icing sugar', 'demerara', 'brown sugar', 'granulated sugar', 'muscovado'], info: { category: 'dry-goods', compartment: 'pantry', expiryDays: 730 } },
  { keywords: ['sugar'], info: { category: 'dry-goods', compartment: 'pantry', expiryDays: 730 } },
  { keywords: ['cornflakes', 'weetabix', 'cheerios', 'shreddies', 'bran flakes', 'crunchy nut', 'special k', 'coco pops'], info: { category: 'dry-goods', compartment: 'pantry', expiryDays: 180 } },
  { keywords: ['porridge', 'porridge oats', 'granola', 'muesli', 'oats', 'quaker'], info: { category: 'dry-goods', compartment: 'pantry', expiryDays: 180 } },
  { keywords: ['cereal'], info: { category: 'dry-goods', compartment: 'pantry', expiryDays: 180 } },
  { keywords: ['stock cube', 'stock cubes', 'oxo', 'bouillon', 'stock pot'], info: { category: 'dry-goods', compartment: 'pantry', expiryDays: 365 } },
  { keywords: ['baking powder', 'baking soda', 'bicarbonate', 'bicarb'], info: { category: 'dry-goods', compartment: 'pantry', expiryDays: 180 } },
  { keywords: ['yeast', 'dried yeast'], info: { category: 'dry-goods', compartment: 'pantry', expiryDays: 120 } },
  { keywords: ['cocoa', 'cocoa powder', 'drinking chocolate'], info: { category: 'dry-goods', compartment: 'pantry', expiryDays: 365 } },
  { keywords: ['breadcrumbs', 'panko'], info: { category: 'dry-goods', compartment: 'pantry', expiryDays: 180 } },

  // ═══════════════════════════════════════
  // CANNED & TINNED
  // ═══════════════════════════════════════
  { keywords: ['baked beans', 'heinz beans'], info: { category: 'canned', compartment: 'pantry', expiryDays: 365 } },
  { keywords: ['chopped tomatoes', 'tinned tomatoes', 'plum tomatoes', 'passata', 'tomato puree', 'tomato paste', 'tomato passata'], info: { category: 'canned', compartment: 'pantry', expiryDays: 365 } },
  { keywords: ['tinned tuna', 'canned tuna', 'tuna chunks', 'tuna flakes'], info: { category: 'canned', compartment: 'pantry', expiryDays: 365 } },
  { keywords: ['tuna'], info: { category: 'canned', compartment: 'pantry', expiryDays: 365 } },
  { keywords: ['chickpeas', 'kidney beans', 'black beans', 'butter beans', 'cannellini', 'borlotti', 'mixed beans', 'haricot'], info: { category: 'canned', compartment: 'pantry', expiryDays: 365 } },
  { keywords: ['lentils', 'red lentils', 'green lentils', 'puy lentils'], info: { category: 'canned', compartment: 'pantry', expiryDays: 365 } },
  { keywords: ['tinned', 'canned'], info: { category: 'canned', compartment: 'pantry', expiryDays: 365 } },
  { keywords: ['sweetcorn tin', 'canned sweetcorn'], info: { category: 'canned', compartment: 'pantry', expiryDays: 365 } },
  { keywords: ['soup', 'tinned soup', 'canned soup'], info: { category: 'canned', compartment: 'pantry', expiryDays: 365 } },
  { keywords: ['coconut milk'], info: { category: 'canned', compartment: 'pantry', expiryDays: 365 } },

  // ═══════════════════════════════════════
  // CONDIMENTS & SAUCES
  // ═══════════════════════════════════════
  { keywords: ['olive oil', 'extra virgin', 'vegetable oil', 'sunflower oil', 'rapeseed oil', 'coconut oil', 'sesame oil', 'groundnut oil', 'fry light', 'spray oil'], info: { category: 'condiments', compartment: 'pantry', expiryDays: 365 } },
  { keywords: ['balsamic', 'apple cider vinegar', 'white wine vinegar', 'red wine vinegar', 'malt vinegar', 'rice vinegar'], info: { category: 'condiments', compartment: 'pantry', expiryDays: 730 } },
  { keywords: ['vinegar'], info: { category: 'condiments', compartment: 'pantry', expiryDays: 730 } },
  { keywords: ['soy sauce', 'worcestershire', 'fish sauce', 'oyster sauce', 'hoisin', 'teriyaki', 'sriracha', 'tabasco'], info: { category: 'condiments', compartment: 'pantry', expiryDays: 365 } },
  { keywords: ['ketchup', 'tomato ketchup', 'heinz ketchup'], info: { category: 'condiments', compartment: 'pantry', expiryDays: 180 } },
  { keywords: ['bbq sauce', 'barbecue sauce', 'brown sauce', 'hp sauce'], info: { category: 'condiments', compartment: 'pantry', expiryDays: 180 } },
  { keywords: ['english mustard', 'dijon', 'wholegrain mustard', 'french mustard'], info: { category: 'condiments', compartment: 'pantry', expiryDays: 365 } },
  { keywords: ['mustard'], info: { category: 'condiments', compartment: 'pantry', expiryDays: 365 } },
  { keywords: ['mayonnaise', 'mayo', 'hellmanns', 'hellmann'], info: { category: 'condiments', compartment: 'fridge', expiryDays: 60 } },
  { keywords: ['salad dressing', 'caesar dressing', 'ranch dressing', 'vinaigrette'], info: { category: 'condiments', compartment: 'fridge', expiryDays: 30 } },
  { keywords: ['honey'], info: { category: 'condiments', compartment: 'pantry', expiryDays: 730 } },
  { keywords: ['peanut butter', 'almond butter', 'nut butter', 'cashew butter'], info: { category: 'condiments', compartment: 'pantry', expiryDays: 180 } },
  { keywords: ['jam', 'marmalade', 'preserve', 'lemon curd'], info: { category: 'condiments', compartment: 'pantry', expiryDays: 180 } },
  { keywords: ['nutella', 'chocolate spread', 'hazelnut spread'], info: { category: 'condiments', compartment: 'pantry', expiryDays: 180 } },
  { keywords: ['marmite', 'bovril', 'vegemite'], info: { category: 'condiments', compartment: 'pantry', expiryDays: 365 } },
  { keywords: ['maple syrup', 'golden syrup', 'agave', 'treacle'], info: { category: 'condiments', compartment: 'pantry', expiryDays: 365 } },
  { keywords: ['vanilla extract', 'vanilla essence', 'vanilla'], info: { category: 'condiments', compartment: 'pantry', expiryDays: 365 } },
  { keywords: ['curry paste', 'curry powder', 'tikka', 'korma', 'garam masala', 'tandoori', 'madras'], info: { category: 'condiments', compartment: 'pantry', expiryDays: 365 } },
  { keywords: ['spice', 'cumin', 'turmeric', 'paprika', 'cinnamon', 'nutmeg', 'mixed spice', 'chilli powder', 'cayenne', 'oregano', 'mixed herbs'], info: { category: 'condiments', compartment: 'pantry', expiryDays: 365 } },
  { keywords: ['black pepper', 'ground pepper', 'white pepper', 'peppercorn'], info: { category: 'condiments', compartment: 'pantry', expiryDays: 730 } },
  { keywords: ['salt', 'sea salt', 'table salt', 'rock salt', 'lo salt'], info: { category: 'condiments', compartment: 'pantry', expiryDays: 1825 } },
  { keywords: ['pesto', 'green pesto', 'red pesto'], info: { category: 'condiments', compartment: 'fridge', expiryDays: 7 } },
  { keywords: ['hummus', 'houmous', 'tzatziki', 'guacamole', 'salsa', 'dip', 'taramasalata'], info: { category: 'condiments', compartment: 'fridge', expiryDays: 7 } },
  { keywords: ['pasta sauce', 'stir fry sauce', 'cooking sauce', 'simmer sauce', 'dolmio', 'loyd grossman'], info: { category: 'condiments', compartment: 'pantry', expiryDays: 365 } },
  { keywords: ['chutney', 'pickle', 'piccalilli', 'relish', 'branston'], info: { category: 'condiments', compartment: 'pantry', expiryDays: 365 } },

  // ═══════════════════════════════════════
  // FROZEN
  // ═══════════════════════════════════════
  { keywords: ['frozen veg', 'frozen vegetable', 'frozen vegetables', 'frozen peas', 'frozen sweetcorn', 'frozen broccoli', 'frozen spinach', 'frozen mixed veg'], info: { category: 'frozen', compartment: 'freezer', expiryDays: 180 } },
  { keywords: ['frozen fruit', 'frozen berries', 'frozen mango', 'frozen strawberries', 'frozen raspberries'], info: { category: 'frozen', compartment: 'freezer', expiryDays: 180 } },
  { keywords: ['ice cream', 'gelato', 'sorbet', 'magnum', 'cornetto', 'ben & jerry', 'häagen-dazs', 'haagen dazs'], info: { category: 'frozen', compartment: 'freezer', expiryDays: 60 } },
  { keywords: ['frozen pizza', 'chicago town', 'dr oetker', 'goodfellas'], info: { category: 'frozen', compartment: 'freezer', expiryDays: 180 } },
  { keywords: ['fish fingers', 'fish finger', 'birds eye'], info: { category: 'frozen', compartment: 'freezer', expiryDays: 90 } },
  { keywords: ['frozen fish', 'frozen cod', 'frozen salmon', 'frozen prawns', 'frozen haddock'], info: { category: 'frozen', compartment: 'freezer', expiryDays: 90 } },
  { keywords: ['frozen chicken', 'chicken nugget', 'chicken nuggets', 'chicken kiev', 'chicken goujons', 'chicken dippers'], info: { category: 'frozen', compartment: 'freezer', expiryDays: 90 } },
  { keywords: ['ready meal', 'ready meals', 'frozen meal', 'frozen dinner', 'microwave meal'], info: { category: 'frozen', compartment: 'freezer', expiryDays: 90 } },
  { keywords: ['oven chips', 'frozen chips', 'french fries', 'frozen fries', 'potato waffle', 'potato waffles', 'hash brown', 'hash browns', 'mccain'], info: { category: 'frozen', compartment: 'freezer', expiryDays: 180 } },
  { keywords: ['frozen pastry', 'puff pastry', 'shortcrust pastry', 'filo pastry', 'jus-rol'], info: { category: 'frozen', compartment: 'freezer', expiryDays: 180 } },
  { keywords: ['frozen yorkshire', 'yorkshire pudding', 'aunt bessie'], info: { category: 'frozen', compartment: 'freezer', expiryDays: 180 } },
  { keywords: ['frozen garlic bread', 'garlic bread', 'garlic baguette'], info: { category: 'frozen', compartment: 'freezer', expiryDays: 90 } },
  { keywords: ['ice lolly', 'ice lollies', 'ice pop', 'calippo', 'fab', 'rocket lolly'], info: { category: 'frozen', compartment: 'freezer', expiryDays: 180 } },

  // ═══════════════════════════════════════
  // BEVERAGES
  // ═══════════════════════════════════════
  { keywords: ['orange juice', 'apple juice', 'cranberry juice', 'tropical juice', 'grape juice', 'pineapple juice', 'pomegranate juice', 'tomato juice'], info: { category: 'beverages', compartment: 'fridge', expiryDays: 7 } },
  { keywords: ['juice', 'smoothie', 'innocent'], info: { category: 'beverages', compartment: 'fridge', expiryDays: 5 } },
  { keywords: ['water', 'mineral water', 'sparkling water', 'spring water', 'evian', 'volvic', 'highland spring', 'buxton'], info: { category: 'beverages', compartment: 'pantry', expiryDays: 365 } },
  { keywords: ['coca cola', 'coke', 'diet coke', 'coke zero', 'pepsi', 'pepsi max', 'fanta', 'sprite', '7up', 'dr pepper', 'irn bru', 'tango'], info: { category: 'beverages', compartment: 'pantry', expiryDays: 180 } },
  { keywords: ['lemonade', 'ginger ale', 'tonic water', 'schweppes', 'fever tree', 'fever-tree'], info: { category: 'beverages', compartment: 'pantry', expiryDays: 180 } },
  { keywords: ['lucozade', 'ribena', 'vimto', 'j2o', 'oasis', 'capri sun'], info: { category: 'beverages', compartment: 'pantry', expiryDays: 180 } },
  { keywords: ['squash', 'cordial', 'robinsons', 'dilute'], info: { category: 'beverages', compartment: 'pantry', expiryDays: 180 } },
  { keywords: ['shloer'], info: { category: 'beverages', compartment: 'pantry', expiryDays: 365 } },
  { keywords: ['tea bag', 'tea bags', 'green tea', 'herbal tea', 'earl grey', 'english breakfast', 'tetley', 'pg tips', 'yorkshire tea', 'twinings', 'pukka'], info: { category: 'beverages', compartment: 'pantry', expiryDays: 365 } },
  { keywords: ['tea'], info: { category: 'beverages', compartment: 'pantry', expiryDays: 365 } },
  { keywords: ['instant coffee', 'ground coffee', 'coffee beans', 'nescafe', 'kenco', 'lavazza', 'coffee pods', 'coffee capsule', 'dolce gusto', 'nespresso', 'tassimo'], info: { category: 'beverages', compartment: 'pantry', expiryDays: 180 } },
  { keywords: ['coffee'], info: { category: 'beverages', compartment: 'pantry', expiryDays: 180 } },
  { keywords: ['beer', 'lager', 'ale', 'stout', 'ipa', 'stella', 'budweiser', 'heineken', 'corona', 'peroni', 'guinness', 'carling', 'fosters', 'john smith'], info: { category: 'beverages', compartment: 'fridge', expiryDays: 180 } },
  { keywords: ['cider', 'strongbow', 'magners', 'kopparberg', 'rekorderlig', 'old mout'], info: { category: 'beverages', compartment: 'fridge', expiryDays: 180 } },
  { keywords: ['wine', 'prosecco', 'champagne', 'pinot', 'sauvignon', 'chardonnay', 'merlot', 'rioja', 'malbec', 'shiraz', 'rosé', 'rose wine'], info: { category: 'beverages', compartment: 'pantry', expiryDays: 365 } },
  { keywords: ['gin', 'vodka', 'whisky', 'whiskey', 'rum', 'brandy', 'tequila', 'baileys', 'amaretto', 'sambuca', 'liqueur'], info: { category: 'beverages', compartment: 'pantry', expiryDays: 730 } },

  // ═══════════════════════════════════════
  // SNACKS
  // ═══════════════════════════════════════
  { keywords: ['crisps', 'walkers', 'doritos', 'pringles', 'kettle chips', 'sensations', 'mccoys', 'tyrrells', 'hula hoops', 'wotsits', 'quavers', 'skips', 'monster munch', 'nik naks'], info: { category: 'snacks', compartment: 'snacks', expiryDays: 60 } },
  { keywords: ['chips'], info: { category: 'snacks', compartment: 'snacks', expiryDays: 60 } },
  { keywords: ['digestive', 'hobnob', 'rich tea', 'bourbon', 'custard cream', 'oreo', 'maryland', 'shortbread', 'jaffa cake', 'jaffa cakes', 'fig roll'], info: { category: 'snacks', compartment: 'snacks', expiryDays: 60 } },
  { keywords: ['biscuit', 'biscuits', 'cookie', 'cookies'], info: { category: 'snacks', compartment: 'snacks', expiryDays: 60 } },
  { keywords: ['cadbury', 'dairy milk', 'galaxy', 'maltesers', 'mars bar', 'snickers', 'twix', 'kit kat', 'kitkat', 'toblerone', 'lindt', 'aero', 'wispa', 'twirl', 'bounty', 'milky way', 'freddo', 'buttons'], info: { category: 'snacks', compartment: 'snacks', expiryDays: 180 } },
  { keywords: ['chocolate', 'choc'], info: { category: 'snacks', compartment: 'snacks', expiryDays: 180 } },
  { keywords: ['popcorn', 'butterkist', 'propercorn'], info: { category: 'snacks', compartment: 'snacks', expiryDays: 60 } },
  { keywords: ['cracker', 'crackers', 'rice cake', 'rice cakes', 'breadstick', 'breadsticks', 'ryvita', 'oatcake'], info: { category: 'snacks', compartment: 'snacks', expiryDays: 90 } },
  { keywords: ['nuts', 'peanuts', 'almonds', 'cashews', 'walnuts', 'mixed nuts', 'pistachios', 'macadamia', 'brazil nuts', 'pecan', 'hazelnuts'], info: { category: 'snacks', compartment: 'pantry', expiryDays: 180 } },
  { keywords: ['dried fruit', 'raisins', 'sultanas', 'dried apricot', 'dried apricots', 'dried cranberry', 'dried cranberries', 'dates', 'prunes'], info: { category: 'snacks', compartment: 'pantry', expiryDays: 180 } },
  { keywords: ['cereal bar', 'protein bar', 'granola bar', 'flapjack', 'tracker', 'nakd', 'kind bar', 'nature valley', 'belvita'], info: { category: 'snacks', compartment: 'snacks', expiryDays: 90 } },
  { keywords: ['sweet', 'sweets', 'haribo', 'wine gums', 'jelly babies', 'fruit pastilles', 'skittles', 'starburst', 'mentos'], info: { category: 'snacks', compartment: 'snacks', expiryDays: 180 } },
  { keywords: ['chewing gum', 'gum', 'mints', 'polo', 'tic tac'], info: { category: 'snacks', compartment: 'snacks', expiryDays: 365 } },

  // ═══════════════════════════════════════
  // DELI / PREPARED / READY
  // ═══════════════════════════════════════
  { keywords: ['coleslaw', 'potato salad'], info: { category: 'other', compartment: 'fridge', expiryDays: 5 } },
  { keywords: ['sandwich', 'meal deal'], info: { category: 'other', compartment: 'fridge', expiryDays: 2 } },
  { keywords: ['pizza', 'fresh pizza'], info: { category: 'other', compartment: 'fridge', expiryDays: 3 } },
  { keywords: ['quiche', 'flan'], info: { category: 'other', compartment: 'fridge', expiryDays: 3 } },
  { keywords: ['pork pie', 'scotch egg', 'sausage roll', 'pasty', 'cornish pasty'], info: { category: 'other', compartment: 'fridge', expiryDays: 4 } },
  { keywords: ['pie'], info: { category: 'other', compartment: 'fridge', expiryDays: 4 } },
  { keywords: ['tofu', 'tempeh', 'quorn', 'linda mccartney'], info: { category: 'produce', compartment: 'fridge', expiryDays: 5 } },
  { keywords: ['cake', 'gateau', 'cheesecake', 'victoria sponge', 'carrot cake', 'lemon drizzle'], info: { category: 'snacks', compartment: 'fridge', expiryDays: 5 } },
  { keywords: ['muffin', 'cupcake', 'cupcakes', 'brownie', 'brownies', 'flapjack', 'doughnut', 'donut', 'donut ring'], info: { category: 'snacks', compartment: 'pantry', expiryDays: 5 } },

  // ═══════════════════════════════════════
  // HOUSEHOLD / NON-FOOD
  // ═══════════════════════════════════════
  { keywords: ['nappy', 'nappies', 'diaper', 'baby wipe', 'baby wipes', 'baby food', 'formula'], info: { category: 'other', compartment: 'pantry', expiryDays: 365 } },
  { keywords: ['toilet roll', 'toilet paper', 'kitchen roll', 'kitchen towel', 'tissue', 'tissues', 'kleenex'], info: { category: 'other', compartment: 'pantry', expiryDays: 730 } },
  { keywords: ['cling film', 'tin foil', 'aluminium foil', 'foil', 'bin bag', 'bin bags', 'bin liner', 'sandwich bag', 'food bag'], info: { category: 'other', compartment: 'pantry', expiryDays: 730 } },
  { keywords: ['washing up liquid', 'fairy', 'washing liquid', 'laundry detergent', 'fabric softener', 'comfort', 'persil', 'ariel', 'bold', 'surf', 'lenor'], info: { category: 'other', compartment: 'pantry', expiryDays: 730 } },
  { keywords: ['bleach', 'cleaner', 'disinfectant', 'antibacterial', 'dettol', 'mr muscle', 'flash', 'cif', 'domestos'], info: { category: 'other', compartment: 'pantry', expiryDays: 730 } },
  { keywords: ['shampoo', 'conditioner', 'body wash', 'shower gel', 'soap', 'hand wash', 'toothpaste', 'deodorant', 'moisturiser', 'moisturizer', 'sunscreen', 'razors', 'dental'], info: { category: 'other', compartment: 'pantry', expiryDays: 730 } },
  { keywords: ['pet food', 'cat food', 'dog food', 'whiskas', 'felix', 'pedigree', 'iams', 'dreamies'], info: { category: 'other', compartment: 'pantry', expiryDays: 365 } },
];

// Pre-compute flat sorted list for efficient lookup (longest keywords first for specificity)
const SORTED_KEYWORDS: { keyword: string; regex: RegExp; info: FoodInfo }[] =
  FOOD_DATABASE.flatMap((entry) =>
    entry.keywords.map((kw) => ({
      keyword: kw.toLowerCase(),
      regex: new RegExp(`\\b${escapeRegex(kw.toLowerCase())}\\b`, 'i'),
      info: entry.info,
    }))
  ).sort((a, b) => b.keyword.length - a.keyword.length);

export function lookupFood(
  name: string,
  customMappings?: Record<string, FoodInfo>
): FoodInfo | null {
  const normalized = name.toLowerCase().trim();

  // Check custom mappings first (exact match on normalized name)
  if (customMappings?.[normalized]) {
    return { ...customMappings[normalized] };
  }

  // Try keyword matching (longest keywords first for specificity)
  for (const { regex, info } of SORTED_KEYWORDS) {
    if (regex.test(normalized)) {
      return { ...info };
    }
  }

  return null;
}
