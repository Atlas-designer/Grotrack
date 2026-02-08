import { useState } from 'react';
import { Trash2, AlertTriangle, Package } from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';
import { useHouse } from '../../contexts/HouseContext';

export function InventoryManagement() {
  const { items, clearAll, clearCompartment } = useInventory();
  const { compartments } = useHouse();
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getItemCount = (compartmentId: string) => {
    return items.filter((item) => item.compartment === compartmentId).length;
  };

  const handleClearAll = async () => {
    setLoading(true);
    try {
      await clearAll();
      setConfirmAction(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCompartment = async (compartmentId: string) => {
    setLoading(true);
    try {
      await clearCompartment(compartmentId);
      setConfirmAction(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-navy-800 rounded-2xl p-4 border border-white/5 space-y-3">
      <div className="flex items-center gap-2">
        <Package size={16} className="text-accent-400" />
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Manage Inventory</p>
      </div>

      {/* Clear All */}
      <div className="space-y-2">
        {confirmAction === 'all' ? (
          <div className="flex items-start gap-2 bg-red-400/10 border border-red-400/20 rounded-xl p-3">
            <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-300">Clear all {items.length} items?</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleClearAll}
                  disabled={loading}
                  className="text-xs text-red-400 font-medium px-3 py-1.5 bg-red-400/15 rounded-lg hover:bg-red-400/25 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Clearing...' : 'Confirm'}
                </button>
                <button
                  onClick={() => setConfirmAction(null)}
                  className="text-xs text-gray-400 px-3 py-1.5 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmAction('all')}
            disabled={items.length === 0}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-navy-700/50 hover:bg-navy-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 size={16} className="text-red-400" />
            <span className="text-sm text-white">Clear All Items</span>
            <span className="text-xs text-gray-500 ml-auto">{items.length} items</span>
          </button>
        )}

        {/* Per-compartment clear */}
        {compartments.map((comp) => {
          const count = getItemCount(comp.id);
          const isConfirming = confirmAction === comp.id;

          if (isConfirming) {
            return (
              <div key={comp.id} className="flex items-start gap-2 bg-red-400/10 border border-red-400/20 rounded-xl p-3">
                <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-300">Clear {count} items from {comp.name}?</p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleClearCompartment(comp.id)}
                      disabled={loading}
                      className="text-xs text-red-400 font-medium px-3 py-1.5 bg-red-400/15 rounded-lg hover:bg-red-400/25 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Clearing...' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => setConfirmAction(null)}
                      className="text-xs text-gray-400 px-3 py-1.5 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <button
              key={comp.id}
              onClick={() => setConfirmAction(comp.id)}
              disabled={count === 0}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-navy-700/50 hover:bg-navy-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 size={14} className="text-gray-500" />
              <span className="text-sm text-white">{comp.name}</span>
              <span className="text-xs text-gray-500 ml-auto">{count} items</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
