import { Package, ShoppingCart, Trash2 } from 'lucide-react';
import { InventoryItem } from '../../types';
import { useHouse } from '../../contexts/HouseContext';

interface InventoryMatchNoticeProps {
  matchedItem: InventoryItem;
  onAddAnyway: () => void;
  onRemoveFromInventory: () => void;
  onCancel: () => void;
}

export function InventoryMatchNotice({
  matchedItem,
  onAddAnyway,
  onRemoveFromInventory,
  onCancel,
}: InventoryMatchNoticeProps) {
  const { compartments } = useHouse();
  const compartment = compartments.find((c) => c.id === matchedItem.compartment);

  const daysLeft = Math.ceil(
    (new Date(matchedItem.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-400/20 rounded-lg flex-shrink-0">
          <Package size={18} className="text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-300">
            "{matchedItem.name}" is already in your {compartment?.name || 'inventory'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Qty: {matchedItem.quantity} {matchedItem.unit}
            {daysLeft > 0 ? ` · Expires in ${daysLeft}d` : ' · Expired'}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onAddAnyway}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-navy-700 border border-white/10 text-white text-sm font-medium rounded-lg hover:bg-navy-600 transition-colors"
        >
          <ShoppingCart size={14} />
          Add Anyway
        </button>
        <button
          onClick={onRemoveFromInventory}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-500/15 border border-red-500/20 text-red-400 text-sm font-medium rounded-lg hover:bg-red-500/25 transition-colors"
        >
          <Trash2 size={14} />
          Remove & Add
        </button>
      </div>

      <button
        onClick={onCancel}
        className="w-full text-center text-xs text-gray-500 hover:text-gray-400"
      >
        Cancel
      </button>
    </div>
  );
}
