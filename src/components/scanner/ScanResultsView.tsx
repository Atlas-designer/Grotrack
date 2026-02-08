import { useState } from 'react';
import { ArrowLeft, Check, Package } from 'lucide-react';
import { ParsedReceiptItem } from '../../utils/receiptParser';
import { useInventory } from '../../hooks/useInventory';
import { useHouse } from '../../contexts/HouseContext';
import { FoodCategory } from '../../types';

interface ScanResultsViewProps {
  items: ParsedReceiptItem[];
  onBack: () => void;
  onDone: () => void;
}

export function ScanResultsView({ items: initialItems, onBack, onDone }: ScanResultsViewProps) {
  const { batchAddItems } = useInventory();
  const { compartments } = useHouse();
  const [items, setItems] = useState(initialItems);
  const [compartmentId, setCompartmentId] = useState(compartments[0]?.id || 'fridge');
  const [category, setCategory] = useState<FoodCategory>('other');
  const [loading, setLoading] = useState(false);

  const selectedCount = items.filter((i) => i.selected).length;
  const allSelected = selectedCount === items.length;

  const toggleAll = () => {
    const newSelected = !allSelected;
    setItems((prev) => prev.map((item) => ({ ...item, selected: newSelected })));
  };

  const toggleItem = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, selected: !item.selected } : item))
    );
  };

  const updateName = (index: number, name: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, name } : item))
    );
  };

  const updateQuantity = (index: number, quantity: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity: Math.max(1, quantity) } : item))
    );
  };

  const handleAddToInventory = async () => {
    const selectedItems = items.filter((i) => i.selected);
    if (selectedItems.length === 0) return;

    setLoading(true);
    try {
      await batchAddItems(
        selectedItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unit: 'pieces' as const,
          compartment: compartmentId,
          category,
          expirationDate: '',
        }))
      );
      onDone();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-navy-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-navy-900/80 backdrop-blur-lg border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-xl">
              <ArrowLeft size={20} className="text-gray-400" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">Review Items</h1>
              <p className="text-sm text-gray-500">{selectedCount} of {items.length} selected</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-48">
        {/* Select / Deselect All */}
        {items.length > 0 && (
          <button
            onClick={toggleAll}
            className="flex items-center gap-2 text-sm text-accent-400 hover:text-accent-300 transition-colors"
          >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
              allSelected ? 'bg-accent-400 border-accent-400' : 'border-gray-600'
            }`}>
              {allSelected && <Check size={12} className="text-navy-950" />}
            </div>
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>
        )}

        {items.length === 0 ? (
          <div className="text-center py-16">
            <Package size={40} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">No items detected in the receipt</p>
            <p className="text-xs text-gray-600 mt-1">Try a clearer photo or different angle</p>
          </div>
        ) : (
          <>
            {/* Item list */}
            {items.map((item, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                  item.selected
                    ? 'bg-navy-800 border-accent-400/20'
                    : 'bg-navy-800/40 border-white/5 opacity-50'
                }`}
              >
                <button
                  onClick={() => toggleItem(index)}
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    item.selected
                      ? 'bg-accent-400 border-accent-400'
                      : 'border-gray-600 bg-transparent'
                  }`}
                >
                  {item.selected && <Check size={14} className="text-navy-950" />}
                </button>

                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateName(index, e.target.value)}
                    className="w-full bg-transparent text-white text-sm font-medium focus:outline-none focus:bg-navy-700 rounded px-1 -mx-1"
                  />
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQuantity(index, item.quantity - 1)}
                    className="w-7 h-7 bg-navy-700 rounded-lg text-gray-400 hover:text-white text-sm flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="text-sm text-white w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(index, item.quantity + 1)}
                    className="w-7 h-7 bg-navy-700 rounded-lg text-gray-400 hover:text-white text-sm flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Bottom bar */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-navy-900 border-t border-white/5 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Compartment</label>
              <select
                value={compartmentId}
                onChange={(e) => setCompartmentId(e.target.value)}
                className="w-full px-2 py-2 bg-navy-700 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-400/50"
              >
                {compartments.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FoodCategory)}
                className="w-full px-2 py-2 bg-navy-700 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-400/50"
              >
                <option value="dairy">Dairy</option>
                <option value="meat">Meat</option>
                <option value="produce">Produce</option>
                <option value="frozen">Frozen</option>
                <option value="canned">Canned Goods</option>
                <option value="dry-goods">Dry Goods</option>
                <option value="snacks">Snacks</option>
                <option value="beverages">Beverages</option>
                <option value="condiments">Condiments</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleAddToInventory}
            disabled={loading || selectedCount === 0}
            className="w-full py-3 bg-accent-400 text-navy-950 font-semibold rounded-xl hover:bg-accent-300 transition-colors disabled:opacity-50"
          >
            {loading ? 'Adding...' : `Add ${selectedCount} Item${selectedCount !== 1 ? 's' : ''} to Inventory`}
          </button>
        </div>
      )}
    </div>
  );
}
