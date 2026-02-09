import { useState, useRef } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { RecipeIngredient, RecipeTag, UnitType, Recipe } from '../../types';
import { useRecipes } from '../../hooks/useRecipes';
import { guessUnit } from '../../utils/guessUnit';

const EMOJI_OPTIONS = [
  '🍳', '🥘', '🍝', '🍲', '🥗', '🌮', '🍛', '🍜',
  '🥧', '🐟', '🍔', '🌭', '🥪', '🥞', '🧀', '🍕',
  '🥣', '🍌', '🥚', '🍅',
];

const TAG_OPTIONS: RecipeTag[] = [
  'quick', 'vegetarian', 'vegan', 'comfort', 'healthy',
  'budget', 'meal-prep', 'breakfast', 'lunch', 'dinner',
  'snack', 'baking',
];

const UNIT_OPTIONS: UnitType[] = ['pieces', 'g', 'kg', 'ml', 'L', 'pack'];

interface AddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingRecipe?: Recipe;
}

export function AddRecipeModal({ isOpen, onClose, editingRecipe }: AddRecipeModalProps) {
  const { addRecipe, updateRecipe, saveBuiltInAsCustom } = useRecipes();
  const stepsEndRef = useRef<HTMLDivElement>(null);
  const ingredientsEndRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState(editingRecipe?.name || '');
  const [emoji, setEmoji] = useState(editingRecipe?.emoji || '🍳');
  const [description, setDescription] = useState(editingRecipe?.description || '');
  const [servings, setServings] = useState(editingRecipe?.servings || 2);
  const [prepTime, setPrepTime] = useState(editingRecipe?.prepTime || 10);
  const [cookTime, setCookTime] = useState(editingRecipe?.cookTime || 20);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(
    editingRecipe?.ingredients || [{ name: '', quantity: 1, unit: 'pieces' }]
  );
  const [instructions, setInstructions] = useState<string[]>(
    editingRecipe?.instructions || ['']
  );
  const [tags, setTags] = useState<RecipeTag[]>(editingRecipe?.tags || []);
  const [notes, setNotes] = useState(editingRecipe?.notes || '');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: 1, unit: 'pieces' }]);
    setTimeout(() => ingredientsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
  };

  const handleRemoveIngredient = (idx: number) => {
    setIngredients(ingredients.filter((_, i) => i !== idx));
  };

  const handleIngredientChange = (idx: number, field: keyof RecipeIngredient, value: string | number | boolean) => {
    setIngredients(ingredients.map((ing, i) => {
      if (i !== idx) return ing;
      const updated = { ...ing, [field]: value };
      // Auto-set unit when name changes (only if user hasn't manually picked a different unit)
      if (field === 'name' && typeof value === 'string' && value.trim()) {
        updated.unit = guessUnit(value);
      }
      return updated;
    }));
  };

  const handleAddStep = () => {
    setInstructions([...instructions, '']);
    setTimeout(() => stepsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
  };

  const handleRemoveStep = (idx: number) => {
    setInstructions(instructions.filter((_, i) => i !== idx));
  };

  const handleStepChange = (idx: number, value: string) => {
    setInstructions(instructions.map((s, i) => (i === idx ? value : s)));
  };

  const toggleTag = (tag: RecipeTag) => {
    setTags(tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag]);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    const validIngredients = ingredients.filter((i) => i.name.trim());
    const validSteps = instructions.filter((s) => s.trim());
    if (validIngredients.length === 0 || validSteps.length === 0) return;

    setSaving(true);
    try {
      const recipeData = {
        name: name.trim(),
        emoji,
        description: description.trim(),
        servings,
        prepTime,
        cookTime,
        ingredients: validIngredients,
        instructions: validSteps,
        tags,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      };

      if (editingRecipe) {
        if (editingRecipe.source === 'built-in') {
          await saveBuiltInAsCustom(editingRecipe, recipeData);
        } else {
          await updateRecipe(editingRecipe.id, recipeData);
        }
      } else {
        await addRecipe(recipeData);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-navy-900 w-full max-w-lg sm:mx-4 rounded-t-2xl sm:rounded-2xl border border-white/10 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 flex-shrink-0">
          <h2 className="text-lg font-bold text-white">
            {editingRecipe ? 'Edit Recipe' : 'New Recipe'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Emoji picker */}
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1.5">Icon</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-colors ${
                    emoji === e
                      ? 'bg-accent-400/20 border-2 border-accent-400'
                      : 'bg-navy-800 border border-white/5 hover:border-white/20'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Recipe name"
              className="w-full px-3 py-2.5 bg-navy-800 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-accent-400/50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description"
              className="w-full px-3 py-2.5 bg-navy-800 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-accent-400/50"
            />
          </div>

          {/* Numbers row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1.5">Servings</label>
              <input
                type="number"
                value={servings}
                onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                className="w-full px-3 py-2.5 bg-navy-800 border border-white/10 rounded-xl text-white text-center focus:outline-none focus:ring-2 focus:ring-accent-400/50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1.5">Prep (min)</label>
              <input
                type="number"
                value={prepTime}
                onChange={(e) => setPrepTime(Math.max(0, parseInt(e.target.value) || 0))}
                min={0}
                className="w-full px-3 py-2.5 bg-navy-800 border border-white/10 rounded-xl text-white text-center focus:outline-none focus:ring-2 focus:ring-accent-400/50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1.5">Cook (min)</label>
              <input
                type="number"
                value={cookTime}
                onChange={(e) => setCookTime(Math.max(0, parseInt(e.target.value) || 0))}
                min={0}
                className="w-full px-3 py-2.5 bg-navy-800 border border-white/10 rounded-xl text-white text-center focus:outline-none focus:ring-2 focus:ring-accent-400/50"
              />
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1.5">Ingredients</label>
            <div className="space-y-2">
              {ingredients.map((ing, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={ing.name}
                      onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                      placeholder="Ingredient"
                      className="flex-1 px-3 py-2 bg-navy-800 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-accent-400/50"
                    />
                    <input
                      type="number"
                      value={ing.quantity}
                      onChange={(e) => handleIngredientChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                      min={0}
                      className="w-16 px-2 py-2 bg-navy-800 border border-white/10 rounded-xl text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-accent-400/50"
                    />
                    <select
                      value={ing.unit}
                      onChange={(e) => handleIngredientChange(idx, 'unit', e.target.value)}
                      className="w-20 px-2 py-2 bg-navy-800 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-400/50"
                    >
                      {UNIT_OPTIONS.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(idx)}
                      className="p-1.5 text-gray-600 hover:text-red-400 rounded-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <label className="flex items-center gap-2 pl-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ing.optional || false}
                      onChange={(e) => handleIngredientChange(idx, 'optional', e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-gray-600 bg-navy-800 text-accent-400 focus:ring-accent-400/50 focus:ring-offset-0"
                    />
                    <span className="text-[11px] text-gray-500">Optional</span>
                  </label>
                </div>
              ))}
            </div>
            <div ref={ingredientsEndRef} />
            <button
              type="button"
              onClick={handleAddIngredient}
              className="mt-2 px-3 py-1.5 text-xs text-accent-400 hover:text-accent-300 bg-accent-400/5 hover:bg-accent-400/10 rounded-lg flex items-center gap-1 transition-colors"
            >
              <Plus size={14} /> Add ingredient
            </button>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1.5">Steps</label>
            <div className="space-y-2">
              {instructions.map((step, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <span className="text-xs text-gray-500 mt-2.5 w-5 text-right flex-shrink-0">{idx + 1}.</span>
                  <textarea
                    value={step}
                    onChange={(e) => handleStepChange(idx, e.target.value)}
                    placeholder={`Step ${idx + 1}`}
                    rows={2}
                    className="flex-1 px-3 py-2 bg-navy-800 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-accent-400/50 resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(idx)}
                    className="p-1.5 text-gray-600 hover:text-red-400 rounded-lg mt-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div ref={stepsEndRef} />
            <button
              type="button"
              onClick={handleAddStep}
              className="mt-2 px-3 py-1.5 text-xs text-accent-400 hover:text-accent-300 bg-accent-400/5 hover:bg-accent-400/10 rounded-lg flex items-center gap-1 transition-colors"
            >
              <Plus size={14} /> Add step
            </button>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1.5">Tags</label>
            <div className="flex flex-wrap gap-2">
              {TAG_OPTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    tags.includes(tag)
                      ? 'bg-accent-400 text-navy-950'
                      : 'bg-navy-800 text-gray-400 border border-white/5'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1.5">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any extra notes..."
              rows={2}
              className="w-full px-3 py-2.5 bg-navy-800 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-accent-400/50 resize-none"
            />
          </div>
        </div>

        {/* Save button */}
        <div className="p-5 border-t border-white/5 flex-shrink-0">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="w-full py-3 bg-accent-400 text-navy-950 font-semibold rounded-xl hover:bg-accent-300 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : editingRecipe ? 'Save Changes' : 'Create Recipe'}
          </button>
        </div>
      </div>
    </div>
  );
}
