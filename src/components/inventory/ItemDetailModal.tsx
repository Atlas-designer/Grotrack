import { useState } from 'react';
import { X, Minus, Plus, ShoppingCart } from 'lucide-react';
import { InventoryItem } from '../../types';
import { useInventory } from '../../hooks/useInventory';
import { useShoppingList } from '../../hooks/useShoppingList';
import { getFoodIcon } from '../../utils/foodIcons';

interface ItemDetailModalProps {
  item: InventoryItem;
  onClose: () => void;
}

export function ItemDetailModal({ item, onClose }: ItemDetailModalProps) {
  const { updateItem, removeItem } = useInventory();
  const { addItem: addToShoppingList } = useShoppingList();
  const [name, setName] = useState(item.name);
  const [quantity, setQuantity] = useState(item.quantity);
  const [expirationDate, setExpirationDate] = useState(item.expirationDate);
  const [opened, setOpened] = useState(item.opened ?? false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const getExpiryStatus = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expirationDate);
    const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return { class: 'text-red-400', text: 'Expired' };
    if (daysLeft <= 3) return { class: 'text-red-400', text: `${daysLeft}d left` };
    if (daysLeft <= 7) return { class: 'text-amber-400', text: `${daysLeft}d left` };
    return { class: 'text-emerald-400', text: `${daysLeft}d left` };
  };

  const expiry = getExpiryStatus();

  const handleToggleOpened = () => {
    const newOpened = !opened;
    setOpened(newOpened);
    if (newOpened) {
      // Set expiry to 3 days from now, unless current expiry is already sooner
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      const threeDaysStr = threeDaysFromNow.toISOString().split('T')[0];
      if (expirationDate > threeDaysStr) {
        setExpirationDate(threeDaysStr);
      }
    }
  };

  const hasChanges =
    name !== item.name ||
    quantity !== item.quantity ||
    expirationDate !== item.expirationDate ||
    opened !== (item.opened ?? false);

  const handleSave = async () => {
    if (!hasChanges) {
      onClose();
      return;
    }
    setSaving(true);
    try {
      await updateItem(item.id, {
        name: name.trim(),
        quantity,
        expirationDate,
        opened,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await removeItem(item.id);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAndAddToList = async () => {
    setSaving(true);
    try {
      await addToShoppingList(name.trim(), quantity, item.unit);
      await removeItem(item.id);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-navy-900 w-full max-w-md sm:mx-4 rounded-t-2xl sm:rounded-2xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">Item Details</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Item icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-navy-800 rounded-2xl flex items-center justify-center border border-white/5">
              <span className="text-4xl">{getFoodIcon(name, item.category)}</span>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 bg-navy-800 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-400/50"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1.5">Quantity</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 bg-navy-800 border border-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:border-accent-400/30 transition-colors"
              >
                <Minus size={18} />
              </button>
              <span className="text-2xl font-bold text-white w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 bg-navy-800 border border-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:border-accent-400/30 transition-colors"
              >
                <Plus size={18} />
              </button>
              <span className="text-sm text-gray-500 ml-1">{item.unit}</span>
            </div>
          </div>

          {/* Expiration date */}
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1.5">
              Expiration Date <span className={`ml-2 ${expiry.class}`}>({expiry.text})</span>
            </label>
            <input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-navy-800 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-400/50 [color-scheme:dark]"
            />
          </div>

          {/* Opened toggle */}
          <div className="flex items-center justify-between bg-navy-800 border border-white/10 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-medium text-white">Opened</p>
              <p className="text-xs text-gray-500">Reduces expiry to 3 days</p>
            </div>
            <button
              onClick={handleToggleOpened}
              className="flex items-center"
            >
              <div className={`w-11 h-6 rounded-full transition-colors flex items-center ${
                opened ? 'bg-accent-400' : 'bg-navy-600'
              }`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform mx-0.5 ${
                  opened ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </div>
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            {!confirmDelete ? (
              <>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex-1 py-2.5 bg-navy-800 border border-red-400/20 text-red-400 text-sm font-medium rounded-xl hover:bg-red-400/10 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !name.trim()}
                  className="flex-[2] py-2.5 bg-accent-400 text-navy-950 text-sm font-semibold rounded-xl hover:bg-accent-300 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : hasChanges ? 'Save Changes' : 'Done'}
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 w-full">
                <button
                  onClick={handleDeleteAndAddToList}
                  disabled={saving}
                  className="w-full py-2.5 bg-accent-400 text-navy-950 text-sm font-semibold rounded-xl hover:bg-accent-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={16} />
                  {saving ? 'Adding...' : 'Add to Shopping List & Delete'}
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 py-2.5 bg-navy-800 border border-white/10 text-white text-sm font-medium rounded-xl hover:bg-navy-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={saving}
                    className="flex-1 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-400 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Deleting...' : 'Just Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
