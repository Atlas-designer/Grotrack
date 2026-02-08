import { useState } from 'react';
import { LogOut, Home, Users, Plus, Copy, Check, ArrowRight, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useHouse } from '../../contexts/HouseContext';
import { House } from '../../types';
import { CreateHouseModal } from './CreateHouseModal';
import { JoinHouseModal } from './JoinHouseModal';
import { DeleteHouseModal } from './DeleteHouseModal';
import { MemberList } from './MemberList';
import { InventoryManagement } from './InventoryManagement';

export function ProfileView() {
  const { user, signOut } = useAuth();
  const { activeHouse, activeHouseId, houses, switchHouse, userProfile } = useHouse();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [deleteHouse, setDeleteHouse] = useState<House | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = async () => {
    if (!activeHouse?.inviteCode) return;
    try {
      await navigator.clipboard.writeText(activeHouse.inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-navy-950">
      <div className="sticky top-0 z-40 bg-navy-900/80 backdrop-blur-lg border-b border-white/5">
        <div className="px-4 py-3">
          <h1 className="text-lg font-bold text-white">Profile</h1>
        </div>
      </div>

      <div className="p-4 space-y-6 pb-24">
        {/* User info */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-accent-400/15 rounded-2xl flex items-center justify-center">
            <span className="text-accent-400 font-bold text-xl">
              {(userProfile?.displayName || user?.email || '?')[0].toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-white">{userProfile?.displayName || 'User'}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        {/* Current house */}
        {activeHouse && (
          <div className="bg-navy-800 rounded-2xl p-4 border border-white/5 space-y-3">
            <div className="flex items-center gap-2">
              <Home size={16} className="text-accent-400" />
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Current House</p>
            </div>

            <div>
              <p className="text-lg font-semibold text-white">{activeHouse.name}</p>
              <p className="text-sm text-gray-500">
                {activeHouse.members.length} {activeHouse.members.length === 1 ? 'member' : 'members'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-navy-700 rounded-lg px-3 py-2">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Invite Code</p>
                <p className="text-lg font-mono font-bold text-white tracking-[0.2em]">
                  {activeHouse.inviteCode}
                </p>
              </div>
              <button
                onClick={handleCopyCode}
                className="p-3 bg-navy-700 rounded-lg hover:bg-navy-600 transition-colors"
              >
                {copiedCode ? (
                  <Check size={18} className="text-accent-400" />
                ) : (
                  <Copy size={18} className="text-gray-400" />
                )}
              </button>
            </div>

            {/* Members */}
            <div className="pt-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Members</p>
              <MemberList />
            </div>
          </div>
        )}

        {/* Inventory Management */}
        {activeHouse && <InventoryManagement />}

        {/* All houses */}
        {houses.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Your Houses</p>
            {houses.map((house) => {
              const isActive = house.id === activeHouseId;
              const canDelete = house.createdBy === user?.uid;
              return (
                <div
                  key={house.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                    isActive
                      ? 'bg-accent-400/10 border-accent-400/20'
                      : 'bg-navy-800 border-white/5'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isActive ? 'bg-accent-400/20' : 'bg-navy-700'
                    }`}
                  >
                    <Home size={18} className={isActive ? 'text-accent-400' : 'text-gray-500'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isActive ? 'text-accent-400' : 'text-white'}`}>
                      {house.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {house.members.length} {house.members.length === 1 ? 'member' : 'members'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {isActive ? (
                      <span className="text-xs text-accent-400 font-medium px-2 py-1 bg-accent-400/10 rounded-lg">
                        Active
                      </span>
                    ) : (
                      <button
                        onClick={() => switchHouse(house.id)}
                        className="text-xs text-gray-400 hover:text-white px-3 py-1.5 bg-navy-700 rounded-lg hover:bg-navy-600 transition-colors"
                      >
                        Switch
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => setDeleteHouse(house)}
                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full flex items-center gap-3 p-3 bg-navy-800 rounded-xl border border-white/5 hover:bg-navy-700 transition-colors"
          >
            <div className="w-10 h-10 bg-accent-400/15 rounded-xl flex items-center justify-center">
              <Plus size={18} className="text-accent-400" />
            </div>
            <span className="text-sm font-medium text-white">Create New House</span>
            <ArrowRight size={16} className="text-gray-600 ml-auto" />
          </button>

          <button
            onClick={() => setShowJoinModal(true)}
            className="w-full flex items-center gap-3 p-3 bg-navy-800 rounded-xl border border-white/5 hover:bg-navy-700 transition-colors"
          >
            <div className="w-10 h-10 bg-violet-400/15 rounded-xl flex items-center justify-center">
              <Users size={18} className="text-violet-400" />
            </div>
            <span className="text-sm font-medium text-white">Join a House</span>
            <ArrowRight size={16} className="text-gray-600 ml-auto" />
          </button>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 p-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>

      <CreateHouseModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
      <JoinHouseModal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} />
      {deleteHouse && (
        <DeleteHouseModal
          isOpen={!!deleteHouse}
          onClose={() => setDeleteHouse(null)}
          house={deleteHouse}
        />
      )}
    </div>
  );
}
