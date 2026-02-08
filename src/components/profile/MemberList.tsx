import { useState, useEffect } from 'react';
import { UserMinus, Crown, Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useHouse } from '../../contexts/HouseContext';
import { useAuth } from '../../contexts/AuthContext';

interface MemberInfo {
  uid: string;
  displayName: string;
  email: string;
}

export function MemberList() {
  const { activeHouse, activeHouseId, removeMember } = useHouse();
  const { user } = useAuth();
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingUid, setRemovingUid] = useState<string | null>(null);
  const [confirmUid, setConfirmUid] = useState<string | null>(null);

  const isCreator = activeHouse?.createdBy === user?.uid;

  useEffect(() => {
    if (!activeHouse) {
      setMembers([]);
      setLoading(false);
      return;
    }

    const fetchMembers = async () => {
      setLoading(true);
      const memberInfos: MemberInfo[] = [];
      for (const uid of activeHouse.members) {
        try {
          const snap = await getDoc(doc(db, 'users', uid));
          if (snap.exists()) {
            const data = snap.data();
            memberInfos.push({
              uid,
              displayName: data.displayName || 'Unknown',
              email: data.email || '',
            });
          } else {
            memberInfos.push({ uid, displayName: 'Unknown User', email: '' });
          }
        } catch {
          memberInfos.push({ uid, displayName: 'Unknown User', email: '' });
        }
      }
      setMembers(memberInfos);
      setLoading(false);
    };

    fetchMembers();
  }, [activeHouse?.members.join(',')]);

  const handleRemove = async (memberUid: string) => {
    if (!activeHouseId) return;
    setRemovingUid(memberUid);
    try {
      await removeMember(activeHouseId, memberUid);
      setConfirmUid(null);
    } catch (err: any) {
      console.error('Failed to remove member:', err);
    } finally {
      setRemovingUid(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 size={18} className="text-gray-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {members.map((member) => {
        const isSelf = member.uid === user?.uid;
        const isMemberCreator = member.uid === activeHouse?.createdBy;
        const isConfirming = confirmUid === member.uid;

        return (
          <div
            key={member.uid}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-navy-700/50"
          >
            <div className="w-8 h-8 bg-accent-400/15 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-accent-400 font-semibold text-sm">
                {member.displayName[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-white truncate">
                  {member.displayName}
                  {isSelf && <span className="text-gray-500 ml-1">(you)</span>}
                </p>
                {isMemberCreator && (
                  <Crown size={12} className="text-amber-400 flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">{member.email}</p>
            </div>

            {isCreator && !isSelf && (
              <>
                {isConfirming ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleRemove(member.uid)}
                      disabled={removingUid === member.uid}
                      className="text-xs text-red-400 font-medium px-2 py-1 bg-red-400/10 rounded-lg hover:bg-red-400/20 transition-colors disabled:opacity-50"
                    >
                      {removingUid === member.uid ? '...' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => setConfirmUid(null)}
                      className="text-xs text-gray-400 px-2 py-1 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmUid(member.uid)}
                    className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  >
                    <UserMinus size={16} />
                  </button>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
