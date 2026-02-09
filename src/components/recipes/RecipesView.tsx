import { useState } from 'react';
import { Plus, ChefHat } from 'lucide-react';
import { RecipeTag, RecipeMatch, Recipe } from '../../types';
import { useRecipes } from '../../hooks/useRecipes';
import { RecipeFilterBar } from './RecipeFilterBar';
import { RecipeCard } from './RecipeCard';
import { RecipeDetailView } from './RecipeDetailView';
import { AddRecipeModal } from './AddRecipeModal';

export function RecipesView() {
  const { allMatches, filterByTag, loading } = useRecipes();
  const [activeTag, setActiveTag] = useState<RecipeTag | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<RecipeMatch | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | undefined>(undefined);

  const filteredMatches = filterByTag(activeTag);
  const filteredReady = filteredMatches.filter((m) => m.allAvailable);
  const filteredAlmost = filteredMatches.filter((m) => !m.allAvailable && m.matchPercentage >= 50);
  const filteredOther = filteredMatches.filter((m) => !m.allAvailable && m.matchPercentage < 50);

  // If viewing a recipe detail, show that instead
  if (selectedMatch) {
    return (
      <RecipeDetailView
        match={selectedMatch}
        onBack={() => setSelectedMatch(null)}
        onEdit={
          selectedMatch.recipe.source === 'custom'
            ? () => {
                setEditingRecipe(selectedMatch.recipe);
                setSelectedMatch(null);
                setIsAddModalOpen(true);
              }
            : undefined
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-navy-950">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-navy-900/80 backdrop-blur-lg border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-white">Recipes</h1>
          <button
            onClick={() => {
              setEditingRecipe(undefined);
              setIsAddModalOpen(true);
            }}
            className="p-2 bg-accent-400 text-navy-950 rounded-xl hover:bg-accent-300 transition-colors"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </div>
        <div className="px-4 pb-3">
          <RecipeFilterBar activeTag={activeTag} onTagChange={setActiveTag} />
        </div>
      </div>

      <div className="p-4 space-y-5 pb-24">
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">Loading recipes...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && allMatches.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-navy-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ChefHat size={28} className="text-gray-600" />
            </div>
            <p className="text-gray-500">No recipes yet</p>
            <p className="text-xs text-gray-600 mt-1">Tap + to create your first recipe</p>
          </div>
        )}

        {/* Ready to Cook */}
        {filteredReady.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <h2 className="text-sm font-semibold text-white">Ready to Cook</h2>
              <span className="text-xs text-gray-500">({filteredReady.length})</span>
            </div>
            <div className="space-y-2">
              {filteredReady.map((match) => (
                <RecipeCard
                  key={match.recipe.id}
                  match={match}
                  onClick={() => setSelectedMatch(match)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Almost Ready */}
        {filteredAlmost.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <h2 className="text-sm font-semibold text-white">Almost Ready</h2>
              <span className="text-xs text-gray-500">({filteredAlmost.length})</span>
            </div>
            <div className="space-y-2">
              {filteredAlmost.map((match) => (
                <RecipeCard
                  key={match.recipe.id}
                  match={match}
                  onClick={() => setSelectedMatch(match)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Other recipes */}
        {filteredOther.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-gray-600" />
              <h2 className="text-sm font-semibold text-white">More Recipes</h2>
              <span className="text-xs text-gray-500">({filteredOther.length})</span>
            </div>
            <div className="space-y-2">
              {filteredOther.map((match) => (
                <RecipeCard
                  key={match.recipe.id}
                  match={match}
                  onClick={() => setSelectedMatch(match)}
                />
              ))}
            </div>
          </div>
        )}

        {/* No filter results */}
        {!loading && filteredMatches.length === 0 && allMatches.length > 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No recipes match this filter</p>
          </div>
        )}
      </div>

      <AddRecipeModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingRecipe(undefined);
        }}
        editingRecipe={editingRecipe}
      />
    </div>
  );
}
