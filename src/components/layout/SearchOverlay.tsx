import { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowLeft } from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';
import { InventoryItem } from '../../types';
import { ItemCard } from '../inventory/ItemCard';
import { ItemDetailModal } from '../inventory/ItemDetailModal';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [detailItem, setDetailItem] = useState<InventoryItem | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { items } = useInventory();

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-navy-950">
      <div className="flex items-center gap-2 p-3 border-b border-white/5 bg-navy-900/80 backdrop-blur-lg">
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-xl"
          aria-label="Close search"
        >
          <ArrowLeft size={22} className="text-gray-400" />
        </button>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your inventory..."
            className="w-full pl-10 pr-10 py-2.5 bg-navy-800 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-400/50"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 overflow-y-auto h-[calc(100vh-70px)]">
        {query === '' ? (
          <p className="text-center text-gray-600 mt-8">
            Start typing to search your inventory
          </p>
        ) : filteredItems.length === 0 ? (
          <p className="text-center text-gray-600 mt-8">
            No items found matching "{query}"
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} compact onClick={setDetailItem} />
            ))}
          </div>
        )}
      </div>

      {detailItem && (
        <ItemDetailModal item={detailItem} onClose={() => setDetailItem(null)} />
      )}
    </div>
  );
}
