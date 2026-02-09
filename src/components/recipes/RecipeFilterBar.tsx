import { RecipeTag } from '../../types';

const TAG_OPTIONS: { value: RecipeTag | null; label: string }[] = [
  { value: null, label: 'All' },
  { value: 'quick', label: 'Quick' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'comfort', label: 'Comfort' },
  { value: 'healthy', label: 'Healthy' },
  { value: 'vegetarian', label: 'Veggie' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'budget', label: 'Budget' },
  { value: 'meal-prep', label: 'Meal Prep' },
  { value: 'snack', label: 'Snack' },
  { value: 'baking', label: 'Baking' },
];

interface RecipeFilterBarProps {
  activeTag: RecipeTag | null;
  onTagChange: (tag: RecipeTag | null) => void;
}

export function RecipeFilterBar({ activeTag, onTagChange }: RecipeFilterBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {TAG_OPTIONS.map((opt) => (
        <button
          key={opt.label}
          onClick={() => onTagChange(opt.value)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
            activeTag === opt.value
              ? 'bg-accent-400 text-navy-950'
              : 'bg-navy-800 text-gray-400 border border-white/5 hover:text-white'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
