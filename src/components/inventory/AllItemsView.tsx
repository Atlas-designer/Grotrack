import { useState } from 'react';
import { ArrowLeft, Package } from 'lucide-react';
import { InventoryItem } from '../../types';
import { useInventory } from '../../hooks/useInventory';
import { useHouse } from '../../contexts/HouseContext';
import { ItemCard } from './ItemCard';
import { ItemActionSheet } from './ItemActionSheet';
import { ItemDetailModal } from './ItemDetailModal';

interface AllItemsViewProps {
  onBack: () => void;
}

export function AllItemsView({ onBack }: AllItemsViewProps) {
  const { items } = useInventory();
  const { compartments } = useHouse();
  const [moveItem, setMoveItem] = useState<InventoryItem | null>(null);
  const [detailItem, setDetailItem] = useState<InventoryItem | null>(null);

  // Group items by compartment
  const groupedItems = compartments
    .map((comp) => ({
      compartment: comp,
      items: items.filter((item) => item.compartment === comp.id),
    }))
    .filter((g) => g.items.length > 0);

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
              <h1 className="text-lg font-bold text-white">All Items</h1>
              <p className="text-sm text-gray-500">
                {items.length} {items.length === 1 ? 'item' : 'items'} total
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 pb-24">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-navy-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package size={28} className="text-gray-600" />
            </div>
            <p className="text-gray-500">No items in your inventory</p>
          </div>
        ) : (
          <div className="space-y-5">
            {groupedItems.map(({ compartment, items: compItems }) => (
              <div key={compartment.id}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${compartment.bgColor}`} />
                  <h2 className="text-sm font-semibold text-white">{compartment.name}</h2>
                  <span className="text-xs text-gray-500">({compItems.length})</span>
                </div>
                <div className="flex flex-col gap-2">
                  {compItems.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      onMove={setMoveItem}
                      onClick={setDetailItem}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {moveItem && (
        <ItemActionSheet item={moveItem} onClose={() => setMoveItem(null)} />
      )}

      {detailItem && (
        <ItemDetailModal item={detailItem} onClose={() => setDetailItem(null)} />
      )}
    </div>
  );
}
