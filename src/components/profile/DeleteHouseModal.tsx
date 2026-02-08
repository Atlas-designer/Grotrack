import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useHouse } from '../../contexts/HouseContext';
import { House } from '../../types';

interface DeleteHouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  house: House;
}

export function DeleteHouseModal({ isOpen, onClose, house }: DeleteHouseModalProps) {
  const { deleteHouse } = useHouse();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    try {
      await deleteHouse(house.id);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete house');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-navy-900 w-full max-w-sm mx-4 rounded-2xl border border-white/10 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Delete House</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-red-400/15 rounded-lg flex-shrink-0">
            <AlertTriangle size={20} className="text-red-400" />
          </div>
          <div>
            <p className="text-sm text-gray-300">
              Are you sure you want to delete <span className="font-semibold text-white">"{house.name}"</span>?
            </p>
            <p className="text-xs text-gray-500 mt-1">
              This will permanently remove all inventory items, shopping list items, and remove all {house.members.length} member{house.members.length !== 1 ? 's' : ''} from this house. This action cannot be undone.
            </p>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm bg-red-400/10 px-3 py-2 rounded-lg mb-4">{error}</p>}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-navy-700 border border-white/10 text-white text-sm font-medium rounded-xl hover:bg-navy-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-400 transition-colors disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete House'}
          </button>
        </div>
      </div>
    </div>
  );
}
