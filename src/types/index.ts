export type CompartmentType = string;

export type FoodCategory =
  | 'dairy'
  | 'meat'
  | 'produce'
  | 'frozen'
  | 'canned'
  | 'dry-goods'
  | 'snacks'
  | 'beverages'
  | 'condiments'
  | 'other';

export type UnitType = 'pieces' | 'kg' | 'g' | 'L' | 'ml' | 'pack';

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: UnitType;
  compartment: CompartmentType;
  category: FoodCategory;
  imageUrl?: string;
  purchaseDate: string;
  expirationDate: string;
  notes?: string;
}

export interface Compartment {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
}

export const DEFAULT_COMPARTMENTS: Compartment[] = [
  { id: 'fridge', name: 'Fridge', icon: 'Refrigerator', color: 'text-blue-700', bgColor: 'bg-pastel-blue' },
  { id: 'freezer', name: 'Freezer', icon: 'Snowflake', color: 'text-pink-700', bgColor: 'bg-pastel-pink' },
  { id: 'pantry', name: 'Pantry', icon: 'Home', color: 'text-yellow-700', bgColor: 'bg-pastel-yellow' },
  { id: 'snacks', name: 'Snacks', icon: 'Cookie', color: 'text-emerald-700', bgColor: 'bg-pastel-green' },
  { id: 'dry-ingredients', name: 'Dry Ingredients', icon: 'Wheat', color: 'text-violet-700', bgColor: 'bg-pastel-lavender' },
  { id: 'wet-ingredients', name: 'Wet Ingredients', icon: 'Droplets', color: 'text-orange-700', bgColor: 'bg-pastel-peach' },
];

export const EXPIRATION_DEFAULTS: Record<FoodCategory, number> = {
  'dairy': 10,
  'meat': 4,
  'produce': 7,
  'frozen': 90,
  'canned': 365,
  'dry-goods': 180,
  'snacks': 60,
  'beverages': 30,
  'condiments': 60,
  'other': 30,
};

// House / Household
export interface House {
  id: string;
  name: string;
  inviteCode: string;
  createdBy: string;
  members: string[];
  createdAt: string;
  compartments?: Compartment[];
}

// User profile stored in Firestore
export interface UserProfile {
  email: string;
  displayName: string;
  activeHouseId: string | null;
  houses: string[];
}

// Shopping list
export interface ShoppingListItem {
  id: string;
  name: string;
  quantity?: number;
  unit?: UnitType;
  checked: boolean;
  addedBy: string;
  addedAt: string;
  checkedBy?: string;
}
