import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { CompartmentType, InventoryItem, DEFAULT_COMPARTMENTS } from '../../types';
import { useInventory } from '../../hooks/useInventory';
import { useHouse } from '../../contexts/HouseContext';
import { ItemCard } from './ItemCard';
import { ItemActionSheet } from './ItemActionSheet';
import { ItemDetailModal } from './ItemDetailModal';

const DEFAULT_IDS = new Set(DEFAULT_COMPARTMENTS.map((c) => c.id));

interface CompartmentViewProps {
  compartment: CompartmentType;
  onBack: () => void;
  onAddItem: () => void;
}

export function CompartmentView({ compartment, onBack, onAddItem }: CompartmentViewProps) {
  const { items } = useInventory();
  const { compartments, removeCompartment } = useHouse();
  const compartmentInfo = compartments.find((c) => c.id === compartment);
  const compartmentItems = items.filter((item) => item.compartment === compartment);
  const [moveItem, setMoveItem] = useState<InventoryItem | null>(null);
  const [detailItem, setDetailItem] = useState<InventoryItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isCustom = !DEFAULT_IDS.has(compartment);

  const handleDeleteCompartment = async () => {
    setDeleting(true);
    try {
      await removeCompartment(compartment);
      onBack();
    } finally {
      setDeleting(false);
    }
  };

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
          <div className="flex items-center gap-1">
            {isCustom && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                aria-label="Delete compartment"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button
              onClick={onAddItem}
              className="p-2.5 bg-accent-400 text-navy-950 rounded-xl hover:bg-accent-300 transition-colors"
              aria-label="Add item"
            >
              <Plus size={20} strokeWidth={2.5} />
            </button>
          </div>
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
          <div className="flex flex-col gap-2">
            {compartmentItems.map((item) => (
              <ItemCard key={item.id} item={item} onMove={setMoveItem} onClick={setDetailItem} />
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

      {/* Delete compartment confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-navy-900 w-full max-w-sm mx-4 rounded-2xl border border-white/10 p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-red-400/15 rounded-lg flex-shrink-0">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Delete "{compartmentInfo?.name}"?</h3>
                <p className="text-sm text-gray-400 mt-1">
                  This compartment will be removed. {compartmentItems.length > 0
                    ? `The ${compartmentItems.length} item${compartmentItems.length !== 1 ? 's' : ''} inside will remain but won't be visible until moved.`
                    : 'It has no items.'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 bg-navy-700 border border-white/10 text-white text-sm font-medium rounded-xl hover:bg-navy-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCompartment}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-400 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
