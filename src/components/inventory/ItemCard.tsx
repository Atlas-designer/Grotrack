import { Trash2, ArrowRightLeft, Check } from 'lucide-react';
import { InventoryItem } from '../../types';
import { useInventory } from '../../hooks/useInventory';
import { getFoodIcon } from '../../utils/foodIcons';
import { getLabelColor } from '../../utils/labelColors';

interface ItemCardProps {
  item: InventoryItem;
  compact?: boolean;
  onEdit?: (item: InventoryItem) => void;
  onMove?: (item: InventoryItem) => void;
  onClick?: (item: InventoryItem) => void;
  selectMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (item: InventoryItem) => void;
}

export function ItemCard({ item, compact = false, onMove, onClick, selectMode, selected, onToggleSelect }: ItemCardProps) {
  const { removeItem } = useInventory();
  const labelColor = getLabelColor(item.label);

  const getExpiryStatus = () => {
    if (item.frozenDaysRemaining) {
      return { class: 'expiry-frozen', text: `Frozen (${item.frozenDaysRemaining}d)` };
    }
    const today = new Date();
    const expiry = new Date(item.expirationDate);
    const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return { class: 'expiry-expired', text: 'Expired' };
    if (daysLeft <= 3) return { class: 'expiry-danger', text: `${daysLeft}d left` };
    if (daysLeft <= 7) return { class: 'expiry-warning', text: `${daysLeft}d left` };
    return { class: 'expiry-safe', text: `${daysLeft}d left` };
  };

  const expiry = getExpiryStatus();
  const icon = getFoodIcon(item.name, item.category);

  const getCardBorder = () => {
    if (selectMode && selected) return 'border-accent-400/50 bg-accent-400/5';
    if (labelColor) return `${labelColor.border} ${labelColor.bg}`;
    return 'border-white/5';
  };

  if (compact) {
    return (
      <div
        className={`bg-navy-800 rounded-xl p-3 border cursor-pointer active:scale-[0.98] transition-transform ${
          labelColor ? `${labelColor.border} ${labelColor.bg}` : 'border-white/5'
        }`}
        onClick={() => onClick?.(item)}
      >
        <div className="flex items-center gap-2">
          {labelColor && <div className={`w-2 h-2 rounded-full ${labelColor.dot} flex-shrink-0`} />}
          <span className="text-xl flex-shrink-0">{icon}</span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-white truncate">{item.name}</p>
            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
          </div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full mt-2 inline-block ${expiry.class}`}>
          {expiry.text}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`bg-navy-800 rounded-xl border p-3 cursor-pointer active:scale-[0.98] transition-all ${getCardBorder()}`}
      onClick={() => selectMode ? onToggleSelect?.(item) : onClick?.(item)}
    >
      <div className="flex items-center gap-3">
        {selectMode && (
          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
            selected ? 'bg-accent-400 border-accent-400' : 'border-gray-600'
          }`}>
            {selected && <Check size={14} className="text-navy-950" />}
          </div>
        )}

        {labelColor && !selectMode && (
          <div className={`w-1.5 h-8 rounded-full ${labelColor.dot} flex-shrink-0`} />
        )}

        <div className="w-10 h-10 bg-navy-700 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">{icon}</span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white text-sm truncate">{item.name}</h3>
          <p className="text-xs text-gray-500">
            Qty: {item.quantity} {item.unit}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full ${expiry.class}`}>
            {expiry.text}
          </span>

          {!selectMode && (
            <div className="flex gap-0.5">
              {onMove && (
                <button
                  onClick={(e) => { e.stopPropagation(); onMove(item); }}
                  className="p-1.5 text-gray-500 hover:text-accent-400 hover:bg-white/5 rounded-lg"
                  aria-label="Move item"
                >
                  <ArrowRightLeft size={14} />
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-white/5 rounded-lg"
                aria-label="Remove item"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
