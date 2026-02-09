import { useState, useMemo, useEffect, useRef } from 'react';
import { ArrowLeft, Check, Package, BookmarkPlus, HelpCircle, Loader2 } from 'lucide-react';
import { ParsedReceiptItem } from '../../utils/receiptParser';
import { expandReceiptName } from '../../utils/receiptAbbreviations';
import { lookupFood } from '../../utils/foodDatabase';
import { searchProductImage } from '../../utils/openFoodFacts';
import { useInventory } from '../../hooks/useInventory';
import { useHouse } from '../../contexts/HouseContext';
import { FoodCategory } from '../../types';

interface ScanItem {
  name: string;
  originalParsedName: string;
  quantity: number;
  selected: boolean;
  category: FoodCategory;
  compartment: string;
  expiryDays: number;
  recognized: boolean;
  saved: boolean;
  imageUrl?: string;
  imageLoading?: boolean;
}

const CATEGORIES: { value: FoodCategory; label: string }[] = [
  { value: 'dairy', label: 'Dairy' },
  { value: 'meat', label: 'Meat' },
  { value: 'produce', label: 'Produce' },
  { value: 'frozen', label: 'Frozen' },
  { value: 'canned', label: 'Canned' },
  { value: 'dry-goods', label: 'Dry Goods' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'condiments', label: 'Condiments' },
  { value: 'other', label: 'Other' },
];

interface ScanResultsViewProps {
  items: ParsedReceiptItem[];
  onBack: () => void;
  onDone: () => void;
}

export function ScanResultsView({ items: initialItems, onBack, onDone }: ScanResultsViewProps) {
  const { batchAddItems } = useInventory();
  const { compartments, foodMappings, nameCorrections, imageCache, saveFoodMapping, saveNameCorrection, saveImageCache } = useHouse();

  const enhancedItems = useMemo(() => {
    return initialItems.map((item): ScanItem => {
      // Expand abbreviations using built-in dictionary + user's saved corrections
      const expandedName = expandReceiptName(item.name, nameCorrections);
      const match = lookupFood(expandedName, foodMappings);
      if (match) {
        const validCompartment = compartments.some((c) => c.id === match.compartment)
          ? match.compartment
          : compartments[0]?.id || 'fridge';
        return {
          ...item,
          name: expandedName,
          originalParsedName: item.name,
          category: match.category,
          compartment: validCompartment,
          expiryDays: match.expiryDays,
          recognized: true,
          saved: false,
        };
      }
      return {
        ...item,
        name: expandedName,
        originalParsedName: item.name,
        category: 'other',
        compartment: compartments[0]?.id || 'fridge',
        expiryDays: 30,
        recognized: false,
        saved: false,
      };
    });
  }, [initialItems, foodMappings, nameCorrections, compartments]);

  // Pre-fill images from cache
  const itemsWithCachedImages = useMemo(() => {
    return enhancedItems.map((item) => {
      const key = item.name.toLowerCase().trim();
      if (imageCache[key]) {
        return { ...item, imageUrl: imageCache[key] };
      }
      return item;
    });
  }, [enhancedItems, imageCache]);

  const [items, setItems] = useState<ScanItem[]>(itemsWithCachedImages);
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef(false);

  // Fetch images from Open Food Facts for items without cached images
  useEffect(() => {
    if (fetchedRef.current || items.length === 0) return;
    fetchedRef.current = true;

    const uncachedIndices = items
      .map((item, i) => (!item.imageUrl ? i : -1))
      .filter((i) => i !== -1);

    if (uncachedIndices.length === 0) return;

    // Mark uncached items as loading
    setItems((prev) =>
      prev.map((item, i) =>
        uncachedIndices.includes(i) ? { ...item, imageLoading: true } : item
      )
    );

    // Fetch sequentially (rate limited)
    let cancelled = false;
    (async () => {
      const newCacheEntries: Record<string, string> = {};
      for (const idx of uncachedIndices) {
        if (cancelled) break;
        const item = items[idx];
        const imageUrl = await searchProductImage(item.name);
        if (cancelled) break;
        if (imageUrl) {
          newCacheEntries[item.name.toLowerCase().trim()] = imageUrl;
        }
        setItems((prev) =>
          prev.map((it, i) =>
            i === idx ? { ...it, imageUrl: imageUrl || undefined, imageLoading: false } : it
          )
        );
      }
      // Save new images to house cache
      if (Object.keys(newCacheEntries).length > 0 && !cancelled) {
        saveImageCache(newCacheEntries).catch(() => {});
      }
    })();

    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedCount = items.filter((i) => i.selected).length;
  const allSelected = items.length > 0 && selectedCount === items.length;

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

  const updateCompartment = (index: number, compartment: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, compartment } : item))
    );
  };

  const updateCategory = (index: number, category: FoodCategory) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, category } : item))
    );
  };

  const updateExpiryDays = (index: number, expiryDays: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, expiryDays: Math.max(1, expiryDays) } : item))
    );
  };

  const getExpiryDate = (item: ScanItem): string => {
    const date = new Date();
    date.setDate(date.getDate() + item.expiryDays);
    return date.toISOString().split('T')[0];
  };

  const formatExpiryDate = (item: ScanItem): string => {
    const date = new Date();
    date.setDate(date.getDate() + item.expiryDays);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const handleRemember = async (index: number) => {
    const item = items[index];
    try {
      await saveFoodMapping(item.name, {
        category: item.category,
        compartment: item.compartment,
        expiryDays: item.expiryDays,
      });
      setItems((prev) =>
        prev.map((it, i) => (i === index ? { ...it, recognized: true, saved: true } : it))
      );
    } catch {
      // silently fail
    }
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
          compartment: item.compartment,
          category: item.category,
          expirationDate: getExpiryDate(item),
          ...(item.imageUrl ? { imageUrl: item.imageUrl } : {}),
        }))
      );

      // Save name corrections for any items the user renamed
      // so future scans auto-expand the same abbreviations
      for (const item of selectedItems) {
        const orig = item.originalParsedName.toLowerCase().trim();
        const current = item.name.trim();
        if (orig && current && orig !== current.toLowerCase()) {
          saveNameCorrection(orig, current).catch(() => {});
        }
      }

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

      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-28">
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
            {items.map((item, index) => (
              <div
                key={index}
                className={`rounded-xl border transition-colors overflow-hidden ${
                  item.selected
                    ? item.recognized
                      ? 'bg-navy-800 border-accent-400/20'
                      : 'bg-navy-800 border-amber-400/30'
                    : 'bg-navy-800/40 border-white/5 opacity-50'
                }`}
              >
                {/* Row 1: checkbox + image + name + quantity */}
                <div className="flex items-center gap-3 p-3 pb-1">
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

                  <div className="w-9 h-9 rounded-lg bg-navy-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.imageLoading ? (
                      <Loader2 size={16} className="text-gray-500 animate-spin" />
                    ) : item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={16} className="text-gray-600" />
                    )}
                  </div>

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

                {/* Row 2: compartment + category selects */}
                <div className="flex items-center gap-2 px-3 pb-1 ml-[4.5rem]">
                  <select
                    value={item.compartment}
                    onChange={(e) => updateCompartment(index, e.target.value)}
                    className="flex-1 px-2 py-1 bg-navy-700 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-accent-400/50"
                  >
                    {compartments.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>

                  <select
                    value={item.category}
                    onChange={(e) => updateCategory(index, e.target.value as FoodCategory)}
                    className="flex-1 px-2 py-1 bg-navy-700 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-accent-400/50"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Row 3: expiry + remember */}
                <div className="flex items-center justify-between px-3 pb-3 pt-1 ml-[4.5rem]">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wide">Exp</span>
                    <input
                      type="number"
                      value={item.expiryDays}
                      onChange={(e) => updateExpiryDays(index, parseInt(e.target.value) || 1)}
                      className="w-10 px-1 py-0.5 bg-navy-700 border border-white/10 rounded text-white text-xs text-center focus:outline-none focus:ring-1 focus:ring-accent-400/50"
                    />
                    <span className="text-[10px] text-gray-500">d</span>
                    <span className="text-[10px] text-gray-400 ml-0.5">({formatExpiryDate(item)})</span>
                  </div>

                  {/* Unrecognized indicator + remember */}
                  <div className="flex items-center gap-1">
                    {!item.recognized && !item.saved && (
                      <>
                        <HelpCircle size={12} className="text-amber-400" />
                        <button
                          onClick={() => handleRemember(index)}
                          className="flex items-center gap-0.5 text-[10px] text-amber-400 hover:text-amber-300 transition-colors"
                        >
                          <BookmarkPlus size={10} />
                          Save
                        </button>
                      </>
                    )}
                    {item.saved && (
                      <span className="text-[10px] text-accent-400">Saved</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Bottom bar */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-navy-900 border-t border-white/5 p-4">
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
