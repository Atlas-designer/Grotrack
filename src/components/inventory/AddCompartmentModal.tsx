import { useState } from 'react';
import { X, Check, LucideIcon } from 'lucide-react';
import { useHouse } from '../../contexts/HouseContext';
import { ICON_MAP } from '../../utils/iconMap';

interface AddCompartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ICON_OPTIONS = Object.keys(ICON_MAP);

const COLOR_OPTIONS = [
  { color: 'text-blue-700', bgColor: 'bg-pastel-blue', label: 'Blue' },
  { color: 'text-pink-700', bgColor: 'bg-pastel-pink', label: 'Pink' },
  { color: 'text-yellow-700', bgColor: 'bg-pastel-yellow', label: 'Yellow' },
  { color: 'text-emerald-700', bgColor: 'bg-pastel-green', label: 'Green' },
  { color: 'text-violet-700', bgColor: 'bg-pastel-lavender', label: 'Lavender' },
  { color: 'text-orange-700', bgColor: 'bg-pastel-peach', label: 'Peach' },
];

export function AddCompartmentModal({ isOpen, onClose }: AddCompartmentModalProps) {
  const { addCompartment } = useHouse();
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Box');
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const colorOption = COLOR_OPTIONS[selectedColorIdx];
      await addCompartment({
        name: name.trim(),
        icon: selectedIcon,
        color: colorOption.color,
        bgColor: colorOption.bgColor,
      });
      setName('');
      setSelectedIcon('Box');
      setSelectedColorIdx(0);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-navy-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto border border-white/10">
        <div className="sticky top-0 bg-navy-900 border-b border-white/5 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Add Compartment</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Wine Rack, Second Fridge"
              className="w-full px-3 py-2.5 bg-navy-700 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-400/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Icon</label>
            <div className="grid grid-cols-5 gap-2">
              {ICON_OPTIONS.map((iconName) => {
                const Icon = ICON_MAP[iconName] as LucideIcon;
                const isSelected = selectedIcon === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setSelectedIcon(iconName)}
                    className={`p-3 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-accent-400/20 border-2 border-accent-400'
                        : 'bg-navy-700 border-2 border-transparent hover:bg-navy-600'
                    }`}
                  >
                    <Icon size={20} className={isSelected ? 'text-accent-400' : 'text-gray-400'} />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Color</label>
            <div className="grid grid-cols-6 gap-2">
              {COLOR_OPTIONS.map((opt, idx) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setSelectedColorIdx(idx)}
                  className={`${opt.bgColor} h-12 rounded-xl flex items-center justify-center transition-all ${
                    selectedColorIdx === idx ? 'ring-2 ring-accent-400 ring-offset-2 ring-offset-navy-900' : ''
                  }`}
                >
                  {selectedColorIdx === idx && <Check size={18} className={opt.color} />}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Preview</label>
            <div className={`${COLOR_OPTIONS[selectedColorIdx].bgColor} p-4 rounded-2xl flex items-center gap-3`}>
              <div className={`w-11 h-11 bg-white/60 rounded-xl flex items-center justify-center ${COLOR_OPTIONS[selectedColorIdx].color}`}>
                {(() => {
                  const PreviewIcon = ICON_MAP[selectedIcon] as LucideIcon;
                  return <PreviewIcon size={24} />;
                })()}
              </div>
              <span className="text-sm font-semibold text-gray-800">
                {name.trim() || 'Compartment Name'}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full py-3 bg-accent-400 text-navy-950 font-semibold rounded-xl hover:bg-accent-300 transition-colors disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Compartment'}
          </button>
        </form>
      </div>
    </div>
  );
}
