import { useState } from 'react';
import { X } from 'lucide-react';
import {
  CompartmentType,
  FoodCategory,
  UnitType,
  EXPIRATION_DEFAULTS
} from '../../types';
import { useInventory } from '../../hooks/useInventory';
import { useHouse } from '../../contexts/HouseContext';

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
  const { compartments } = useHouse();

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState<UnitType>('pieces');
  const [compartment, setCompartment] = useState<CompartmentType>(defaultCompartment || 'fridge');
  const [category, setCategory] = useState<FoodCategory>('other');
  const [expirationDate, setExpirationDate] = useState('');

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
    });

    // Reset form
    setName('');
    setQuantity(1);
    setUnit('pieces');
    setCategory('other');
    setExpirationDate('');
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
          <div>
            <label className={labelClasses}>Item Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Milk, Eggs, Bread"
              className={inputClasses}
              required
            />
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
