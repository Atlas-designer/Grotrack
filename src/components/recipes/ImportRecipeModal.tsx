import { useState } from 'react';
import { X, Download, AlertCircle, Check } from 'lucide-react';
import { useRecipes } from '../../hooks/useRecipes';
import { importRecipe } from '../../utils/recipeShare';

interface ImportRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportRecipeModal({ isOpen, onClose }: ImportRecipeModalProps) {
  const { addRecipe } = useRecipes();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [imported, setImported] = useState(false);

  if (!isOpen) return null;

  const handleImport = async () => {
    setError('');
    const parsed = importRecipe(code);
    if (!parsed) {
      setError('Invalid recipe code. Make sure you paste the full code starting with GRORECIPE:');
      return;
    }

    setSaving(true);
    try {
      await addRecipe(parsed);
      setImported(true);
      setTimeout(() => {
        setCode('');
        setImported(false);
        onClose();
      }, 1000);
    } catch {
      setError('Failed to save recipe. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-navy-900 w-full max-w-md sm:mx-4 rounded-t-2xl sm:rounded-2xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Download size={18} />
            Import Recipe
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-400">
            Paste a recipe code shared by a friend to add it to your recipes.
          </p>

          <textarea
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError('');
            }}
            placeholder="Paste recipe code here (GRORECIPE:...)"
            rows={4}
            className="w-full px-3 py-2.5 bg-navy-800 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-accent-400/50 resize-none font-mono"
          />

          {error && (
            <div className="flex items-start gap-2 text-red-400 text-xs">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={saving || !code.trim() || imported}
            className={`w-full py-3 font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
              imported
                ? 'bg-emerald-400/10 text-emerald-400'
                : 'bg-accent-400 text-navy-950 hover:bg-accent-300'
            }`}
          >
            {imported ? (
              <>
                <Check size={18} />
                Recipe Imported
              </>
            ) : saving ? (
              'Importing...'
            ) : (
              <>
                <Download size={18} />
                Import Recipe
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
