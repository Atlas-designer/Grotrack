import { useState, useRef } from 'react';
import { X, Package, Loader2 } from 'lucide-react';
import {
  CompartmentType,
  FoodCategory,
  UnitType,
  EXPIRATION_DEFAULTS
} from '../../types';
import { useInventory } from '../../hooks/useInventory';
import { useHouse } from '../../contexts/HouseContext';
import { searchProductImage } from '../../utils/openFoodFacts';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCompartment?: CompartmentType;
}

const CATEGORIES: { value: FoodCategory; label: string }[] = [
  { value: 'dairy', label: 'Dairy' },
  { value: 'meat', label: 'Meat' },
  { value: 'produce', label: 'Produce' },
  { value: 'frozen', label: 'Frozen' },
  { value: 'canned', label: 'Canned Goods' },
  { value: 'dry-goods', label: 'Dry Goods' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'condiments', label: 'Condiments' },
  { value: 'other', label: 'Other' },
];

const UNITS: { value: UnitType; label: string }[] = [
  { value: 'pieces', label: 'Pieces' },
  { value: 'pack', label: 'Pack' },
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'L', label: 'L' },
  { value: 'ml', label: 'ml' },
];

const inputClasses = 'w-full px-3 py-2.5 bg-navy-700 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-400/50 focus:border-accent-400/50';
const labelClasses = 'block text-sm font-medium text-gray-400 mb-1.5';

export function AddItemModal({ isOpen, onClose, defaultCompartment }: AddItemModalProps) {
  const { addItem } = useInventory();
  const { compartments, imageCache, saveImageCache } = useHouse();

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState<UnitType>('pieces');
  const [compartment, setCompartment] = useState<CompartmentType>(defaultCompartment || 'fridge');
  const [category, setCategory] = useState<FoodCategory>('other');
  const [expirationDate, setExpirationDate] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [imageLoading, setImageLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  // Use refs so the debounced callback always sees the latest values
  const imageCacheRef = useRef(imageCache);
  imageCacheRef.current = imageCache;
  const saveImageCacheRef = useRef(saveImageCache);
  saveImageCacheRef.current = saveImageCache;

  const getDefaultExpiry = (cat: FoodCategory) => {
    const days = EXPIRATION_DEFAULTS[cat];
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  const handleCategoryChange = (newCategory: FoodCategory) => {
    setCategory(newCategory);
    if (!expirationDate) {
      setExpirationDate(getDefaultExpiry(newCategory));
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const key = value.toLowerCase().trim();
      if (!key || key.length < 2) {
        setImageUrl(undefined);
        return;
      }

      // Check cache first
      if (imageCacheRef.current[key]) {
        setImageUrl(imageCacheRef.current[key]);
        return;
      }

      setImageLoading(true);
      const url = await searchProductImage(value);
      setImageLoading(false);
      setImageUrl(url || undefined);

      if (url) {
        saveImageCacheRef.current({ [key]: url }).catch(() => {});
      }
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    addItem({
      name: name.trim(),
      quantity,
      unit,
      compartment,
      category,
      expirationDate: expirationDate || getDefaultExpiry(category),
      ...(imageUrl ? { imageUrl } : {}),
    });

    // Reset form
    setName('');
    setQuantity(1);
    setUnit('pieces');
    setCategory('other');
    setExpirationDate('');
    setImageUrl(undefined);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-navy-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto border border-white/10">
        <div className="sticky top-0 bg-navy-900 border-b border-white/5 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Add Item</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl"
            aria-label="Close"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Image preview + Name */}
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-xl bg-navy-700 flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/5">
              {imageLoading ? (
                <Loader2 size={20} className="text-gray-500 animate-spin" />
              ) : imageUrl ? (
                <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <Package size={24} className="text-gray-600" />
              )}
            </div>
            <div className="flex-1">
              <label className={labelClasses}>Item Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., Milk, Eggs, Bread"
                className={inputClasses}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClasses}>Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className={inputClasses}
              />
            </div>
            <div>
              <label className={labelClasses}>Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as UnitType)}
                className={inputClasses}
              >
                {UNITS.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClasses}>Compartment</label>
            <select
              value={compartment}
              onChange={(e) => setCompartment(e.target.value as CompartmentType)}
              className={inputClasses}
            >
              {compartments.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClasses}>Category</label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value as FoodCategory)}
              className={inputClasses}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClasses}>Expiration Date</label>
            <input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className={inputClasses}
            />
            <p className="text-xs text-gray-600 mt-1.5">
              Leave empty to use default based on category
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-accent-400 text-navy-950 font-semibold rounded-xl hover:bg-accent-300 transition-colors"
          >
            Add to Inventory
          </button>
        </form>
      </div>
    </div>
  );
}
