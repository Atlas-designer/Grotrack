import { useState } from 'react';
import { Plus, Check, X, ClipboardList } from 'lucide-react';
import { useShoppingList } from '../../hooks/useShoppingList';
import { useInventory } from '../../hooks/useInventory';
import { InventoryMatchNotice } from './InventoryMatchNotice';
import { InventoryItem } from '../../types';

export function ShoppingListView() {
  const { items, addItem, toggleItem, removeItem, clearChecked, loading } = useShoppingList();
  const { items: inventoryItems, removeItem: removeInventoryItem } = useInventory();

  const [inputValue, setInputValue] = useState('');
  const [matchedItem, setMatchedItem] = useState<InventoryItem | null>(null);

  const uncheckedItems = items.filter((i) => !i.checked);
  const checkedItems = items.filter((i) => i.checked);

  const checkInventory = (name: string): InventoryItem | undefined => {
    return inventoryItems.find(
      (item) => item.name.toLowerCase().trim() === name.toLowerCase().trim()
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = inputValue.trim();
    if (!name) return;

    const match = checkInventory(name);
    if (match) {
      setMatchedItem(match);
      return;
    }

    addItem(name);
    setInputValue('');
  };

  const handleAddAnyway = () => {
    addItem(inputValue.trim());
    setInputValue('');
    setMatchedItem(null);
  };

  const handleRemoveFromInventory = () => {
    if (matchedItem) {
      removeInventoryItem(matchedItem.id);
    }
    addItem(inputValue.trim());
    setInputValue('');
    setMatchedItem(null);
  };

  return (
    <div className="min-h-screen bg-navy-950">
      <div className="sticky top-0 z-40 bg-navy-900/80 backdrop-blur-lg border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-white">Shopping List</h1>
          {checkedItems.length > 0 && (
            <button
              onClick={clearChecked}
              className="text-xs text-gray-500 hover:text-red-400 px-3 py-1.5 bg-navy-800 rounded-lg border border-white/5 transition-colors"
            >
              Clear Done ({checkedItems.length})
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4 pb-24">
        {/* Add item input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (matchedItem) setMatchedItem(null);
            }}
            placeholder="Add an item..."
            className="flex-1 px-4 py-3 bg-navy-800 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-400/50"
          />
          <button
            type="submit"
            className="px-4 bg-accent-400 text-navy-950 rounded-xl hover:bg-accent-300 transition-colors"
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
        </form>

        {/* Inventory match notice */}
        {matchedItem && (
          <InventoryMatchNotice
            matchedItem={matchedItem}
            onAddAnyway={handleAddAnyway}
            onRemoveFromInventory={handleRemoveFromInventory}
            onCancel={() => {
              setMatchedItem(null);
              setInputValue('');
            }}
          />
        )}

        {/* Empty state */}
        {items.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-navy-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ClipboardList size={28} className="text-gray-600" />
            </div>
            <p className="text-gray-500">Your shopping list is empty</p>
            <p className="text-xs text-gray-600 mt-1">Add items above to get started</p>
          </div>
        )}

        {/* Unchecked items */}
        {uncheckedItems.length > 0 && (
          <div className="space-y-2">
            {uncheckedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-navy-800 rounded-xl border border-white/5"
              >
                <button
                  onClick={() => toggleItem(item.id, true)}
                  className="w-6 h-6 rounded-lg border-2 border-gray-600 hover:border-accent-400 flex items-center justify-center flex-shrink-0 transition-colors"
                >
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{item.name}</p>
                  {item.quantity && (
                    <p className="text-xs text-gray-500">
                      {item.quantity} {item.unit || ''}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1.5 text-gray-600 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Checked items */}
        {checkedItems.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Done
            </p>
            {checkedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-navy-800/50 rounded-xl border border-white/5"
              >
                <button
                  onClick={() => toggleItem(item.id, false)}
                  className="w-6 h-6 rounded-lg bg-accent-400/20 border-2 border-accent-400/50 flex items-center justify-center flex-shrink-0 transition-colors"
                >
                  <Check size={14} className="text-accent-400" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-500 line-through truncate">{item.name}</p>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1.5 text-gray-700 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
