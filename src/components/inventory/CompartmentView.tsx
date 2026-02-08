import { useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { CompartmentType, InventoryItem } from '../../types';
import { useInventory } from '../../hooks/useInventory';
import { useHouse } from '../../contexts/HouseContext';
import { ItemCard } from './ItemCard';
import { ItemActionSheet } from './ItemActionSheet';

interface CompartmentViewProps {
  compartment: CompartmentType;
  onBack: () => void;
  onAddItem: () => void;
}

export function CompartmentView({ compartment, onBack, onAddItem }: CompartmentViewProps) {
  const { items } = useInventory();
  const { compartments } = useHouse();
  const compartmentInfo = compartments.find((c) => c.id === compartment);
  const compartmentItems = items.filter((item) => item.compartment === compartment);
  const [moveItem, setMoveItem] = useState<InventoryItem | null>(null);

  return (
    <div className="min-h-screen bg-navy-950">
      <header className="sticky top-0 z-40 bg-navy-900/80 backdrop-blur-lg border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={22} className="text-gray-400" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">{compartmentInfo?.name}</h1>
              <p className="text-sm text-gray-500">
                {compartmentItems.length} {compartmentItems.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <button
            onClick={onAddItem}
            className="p-2.5 bg-accent-400 text-navy-950 rounded-xl hover:bg-accent-300 transition-colors"
            aria-label="Add item"
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
        </div>
      </header>

      <div className="p-4 pb-24">
        {compartmentItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">No items in {compartmentInfo?.name}</p>
            <button
              onClick={onAddItem}
              className="px-5 py-2.5 bg-accent-400 text-navy-950 font-medium rounded-xl hover:bg-accent-300 transition-colors"
            >
              Add your first item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {compartmentItems.map((item) => (
              <ItemCard key={item.id} item={item} onMove={setMoveItem} />
            ))}
          </div>
        )}
      </div>

      {moveItem && (
        <ItemActionSheet item={moveItem} onClose={() => setMoveItem(null)} />
      )}
    </div>
  );
}
