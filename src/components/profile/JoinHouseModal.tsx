import { useState } from 'react';
import { X } from 'lucide-react';
import { useHouse } from '../../contexts/HouseContext';

interface JoinHouseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinHouseModal({ isOpen, onClose }: JoinHouseModalProps) {
  const { joinHouse } = useHouse();
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteCode.trim().length < 6) return;
    setError('');
    setLoading(true);
    try {
      await joinHouse(inviteCode.trim());
      setInviteCode('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to join house');
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
          <h2 className="text-lg font-semibold text-white">Join a House</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Invite Code</label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="e.g., A3X9K2"
              maxLength={6}
              className="w-full px-3 py-2.5 bg-navy-700 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-400/50 text-center text-2xl tracking-[0.3em] font-mono"
              required
            />
          </div>
          {error && <p className="text-red-400 text-sm bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>}
          <button
            type="submit"
            disabled={loading || inviteCode.length < 6}
            className="w-full py-3 bg-accent-400 text-navy-950 font-semibold rounded-xl hover:bg-accent-300 transition-colors disabled:opacity-50"
          >
            {loading ? 'Joining...' : 'Join House'}
          </button>
        </form>
      </div>
    </div>
  );
}
