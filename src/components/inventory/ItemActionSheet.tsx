import { useState } from 'react';
import { X, ArrowRightLeft, LucideIcon } from 'lucide-react';
import { InventoryItem } from '../../types';
import { useInventory } from '../../hooks/useInventory';
import { useHouse } from '../../contexts/HouseContext';
import { ICON_MAP } from '../../utils/iconMap';
import { Box } from 'lucide-react';

interface ItemActionSheetProps {
  item: InventoryItem;
  onClose: () => void;
}

export function ItemActionSheet({ item, onClose }: ItemActionSheetProps) {
  const { moveItem } = useInventory();
  const { compartments } = useHouse();
  const [loading, setLoading] = useState(false);

  const otherCompartments = compartments.filter((c) => c.id !== item.compartment);
  const currentCompartment = compartments.find((c) => c.id === item.compartment);

  const handleMove = async (compartmentId: string) => {
    setLoading(true);
    try {
      await moveItem(item.id, compartmentId);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-navy-900 w-full sm:max-w-md rounded-t-2xl border border-white/10 max-h-[70vh] overflow-y-auto">
        <div className="sticky top-0 bg-navy-900 border-b border-white/5 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white truncate pr-2">{item.name}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl flex-shrink-0">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Current location */}
          <div>
            <p className="text-xs text-gray-500 mb-1">Currently in</p>
            <div className={`${currentCompartment?.bgColor || 'bg-navy-700'} px-3 py-2 rounded-xl flex items-center gap-2`}>
              {(() => {
                const Icon = ICON_MAP[currentCompartment?.icon || ''] || Box;
                return <Icon size={18} className={currentCompartment?.color || 'text-gray-500'} />;
              })()}
              <span className="text-sm font-medium text-gray-800">
                {currentCompartment?.name || item.compartment}
              </span>
            </div>
          </div>

          {/* Move to */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ArrowRightLeft size={14} className="text-gray-400" />
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Move to</p>
            </div>
            <div className="space-y-1.5">
              {otherCompartments.map((comp) => {
                const Icon: LucideIcon = ICON_MAP[comp.icon] || Box;
                return (
                  <button
                    key={comp.id}
                    onClick={() => handleMove(comp.id)}
                    disabled={loading}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-navy-700/50 hover:bg-navy-700 transition-colors disabled:opacity-50 active:scale-[0.98]"
                  >
                    <div className={`w-9 h-9 ${comp.bgColor} rounded-lg flex items-center justify-center`}>
                      <Icon size={18} className={comp.color} />
                    </div>
                    <span className="text-sm font-medium text-white">{comp.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom safe area padding */}
        <div className="h-6" />
      </div>
    </div>
  );
}
