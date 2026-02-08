import { Trash2, Edit2, Package, ArrowRightLeft } from 'lucide-react';
import { InventoryItem } from '../../types';
import { useInventory } from '../../hooks/useInventory';

interface ItemCardProps {
  item: InventoryItem;
  compact?: boolean;
  onEdit?: (item: InventoryItem) => void;
  onMove?: (item: InventoryItem) => void;
}

export function ItemCard({ item, compact = false, onEdit, onMove }: ItemCardProps) {
  const { removeItem } = useInventory();

  const getExpiryStatus = () => {
    const today = new Date();
    const expiry = new Date(item.expirationDate);
    const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return { class: 'expiry-expired', text: 'Expired' };
    if (daysLeft <= 3) return { class: 'expiry-danger', text: `${daysLeft}d left` };
    if (daysLeft <= 7) return { class: 'expiry-warning', text: `${daysLeft}d left` };
    return { class: 'expiry-safe', text: `${daysLeft}d left` };
  };

  const expiry = getExpiryStatus();

  if (compact) {
    return (
      <div className="bg-navy-800 rounded-xl p-3 border border-white/5">
        <div className="flex items-center gap-2 mb-2">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="w-10 h-10 object-cover rounded-lg" />
          ) : (
            <div className="w-10 h-10 bg-navy-700 rounded-lg flex items-center justify-center">
              <Package size={20} className="text-gray-500" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-white truncate">{item.name}</p>
            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
          </div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${expiry.class}`}>
          {expiry.text}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-navy-800 rounded-2xl border border-white/5 overflow-hidden card-hover">
      <div className="aspect-square bg-navy-700 flex items-center justify-center">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <Package size={40} className="text-gray-600" />
        )}
      </div>

      <div className="p-3">
        <h3 className="font-medium text-white truncate">{item.name}</h3>
        <p className="text-sm text-gray-500 mb-2">
          Qty: {item.quantity} {item.unit}
        </p>

        <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-1 rounded-full ${expiry.class}`}>
            {expiry.text}
          </span>

          <div className="flex gap-1">
            {onMove && (
              <button
                onClick={() => onMove(item)}
                className="p-1.5 text-gray-500 hover:text-accent-400 hover:bg-white/5 rounded-lg"
                aria-label="Move item"
              >
                <ArrowRightLeft size={16} />
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(item)}
                className="p-1.5 text-gray-500 hover:text-accent-400 hover:bg-white/5 rounded-lg"
                aria-label="Edit item"
              >
                <Edit2 size={16} />
              </button>
            )}
            <button
              onClick={() => removeItem(item.id)}
              className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-white/5 rounded-lg"
              aria-label="Remove item"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
