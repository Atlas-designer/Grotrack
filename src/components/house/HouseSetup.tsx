import { useState } from 'react';
import { Home, Users, ArrowRight } from 'lucide-react';
import { useHouse } from '../../contexts/HouseContext';

export function HouseSetup() {
  const { createHouse, joinHouse } = useHouse();
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [name, setName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const inputClasses = 'w-full px-4 py-3 bg-navy-700 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-400/50';

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError('');
    setLoading(true);
    try {
      await createHouse(name.trim());
    } catch (err: any) {
      setError(err?.message || 'Failed to create house');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setError('');
    setLoading(true);
    try {
      await joinHouse(inviteCode.trim());
    } catch (err: any) {
      setError(err?.message || 'Failed to join house');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'create') {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <button onClick={() => setMode('choose')} className="text-gray-500 text-sm mb-6 hover:text-gray-300">
            &larr; Back
          </button>
          <div className="w-14 h-14 bg-accent-400/15 rounded-2xl flex items-center justify-center mb-4">
            <Home size={28} className="text-accent-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Create a House</h2>
          <p className="text-gray-500 text-sm mb-6">Give your household a name. You'll get an invite code to share with family.</p>

          <form onSubmit={handleCreate} className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., The Smiths, Home, Flat 4B"
              className={inputClasses}
              required
            />
            {error && <p className="text-red-400 text-sm bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-accent-400 text-navy-950 font-semibold rounded-xl hover:bg-accent-300 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create House'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (mode === 'join') {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <button onClick={() => setMode('choose')} className="text-gray-500 text-sm mb-6 hover:text-gray-300">
            &larr; Back
          </button>
          <div className="w-14 h-14 bg-violet-400/15 rounded-2xl flex items-center justify-center mb-4">
            <Users size={28} className="text-violet-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Join a House</h2>
          <p className="text-gray-500 text-sm mb-6">Enter the 6-character invite code shared by a household member.</p>

          <form onSubmit={handleJoin} className="space-y-4">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="e.g., A3X9K2"
              maxLength={6}
              className={`${inputClasses} text-center text-2xl tracking-[0.3em] font-mono`}
              required
            />
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

  // Choose mode
  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Welcome to Grotrack</h2>
        <p className="text-gray-500 text-sm mb-8">Set up your household to start tracking groceries together.</p>

        <div className="space-y-3">
          <button
            onClick={() => setMode('create')}
            className="w-full p-4 bg-navy-800 border border-white/5 rounded-2xl flex items-center gap-4 hover:bg-navy-700 transition-colors text-left"
          >
            <div className="w-12 h-12 bg-accent-400/15 rounded-xl flex items-center justify-center flex-shrink-0">
              <Home size={24} className="text-accent-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white">Create a House</p>
              <p className="text-xs text-gray-500">Start a new household inventory</p>
            </div>
            <ArrowRight size={18} className="text-gray-600" />
          </button>

          <button
            onClick={() => setMode('join')}
            className="w-full p-4 bg-navy-800 border border-white/5 rounded-2xl flex items-center gap-4 hover:bg-navy-700 transition-colors text-left"
          >
            <div className="w-12 h-12 bg-violet-400/15 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users size={24} className="text-violet-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white">Join a House</p>
              <p className="text-xs text-gray-500">Enter an invite code from someone</p>
            </div>
            <ArrowRight size={18} className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
