import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { House, UserProfile } from '../types';

interface HouseContextValue {
  activeHouse: House | null;
  activeHouseId: string | null;
  houses: House[];
  userProfile: UserProfile | null;
  loading: boolean;
  createHouse: (name: string) => Promise<string>;
  joinHouse: (inviteCode: string) => Promise<void>;
  switchHouse: (houseId: string) => Promise<void>;
  leaveHouse: (houseId: string) => Promise<void>;
}

const HouseContext = createContext<HouseContextValue | null>(null);

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 to avoid confusion
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function HouseProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeHouse, setActiveHouse] = useState<House | null>(null);
  const [activeHouseId, setActiveHouseId] = useState<string | null>(null);
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user profile when auth changes
  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      setActiveHouse(null);
      setActiveHouseId(null);
      setHouses([]);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setUserProfile(data);
        setActiveHouseId(data.activeHouseId);
      } else {
        setUserProfile(null);
        setActiveHouseId(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  // Load active house details when activeHouseId changes
  useEffect(() => {
    if (!activeHouseId) {
      setActiveHouse(null);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'houses', activeHouseId), (snap) => {
      if (snap.exists()) {
        setActiveHouse({ id: snap.id, ...snap.data() } as House);
      } else {
        setActiveHouse(null);
      }
    });

    return unsubscribe;
  }, [activeHouseId]);

  // Load all houses the user belongs to
  useEffect(() => {
    if (!userProfile || userProfile.houses.length === 0) {
      setHouses([]);
      return;
    }

    // Listen to each house doc
    const unsubscribes = userProfile.houses.map((houseId) =>
      onSnapshot(doc(db, 'houses', houseId), (snap) => {
        if (snap.exists()) {
          const houseData = { id: snap.id, ...snap.data() } as House;
          setHouses((prev) => {
            const filtered = prev.filter((h) => h.id !== houseId);
            return [...filtered, houseData];
          });
        }
      })
    );

    return () => unsubscribes.forEach((unsub) => unsub());
  }, [userProfile?.houses.join(',')]);

  const createHouse = async (name: string): Promise<string> => {
    if (!user) throw new Error('Not authenticated');

    const houseRef = doc(collection(db, 'houses'));
    const inviteCode = generateInviteCode();

    await setDoc(houseRef, {
      name,
      inviteCode,
      createdBy: user.uid,
      members: [user.uid],
      createdAt: new Date().toISOString(),
    });

    // Update user profile
    await updateDoc(doc(db, 'users', user.uid), {
      houses: arrayUnion(houseRef.id),
      activeHouseId: houseRef.id,
    });

    return houseRef.id;
  };

  const joinHouse = async (inviteCode: string) => {
    if (!user) throw new Error('Not authenticated');

    const q = query(collection(db, 'houses'), where('inviteCode', '==', inviteCode.toUpperCase()));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error('No house found with that invite code');
    }

    const houseDoc = snapshot.docs[0];

    // Add user to house members
    await updateDoc(doc(db, 'houses', houseDoc.id), {
      members: arrayUnion(user.uid),
    });

    // Update user profile
    await updateDoc(doc(db, 'users', user.uid), {
      houses: arrayUnion(houseDoc.id),
      activeHouseId: houseDoc.id,
    });
  };

  const switchHouse = async (houseId: string) => {
    if (!user) throw new Error('Not authenticated');
    await updateDoc(doc(db, 'users', user.uid), {
      activeHouseId: houseId,
    });
  };

  const leaveHouse = async (houseId: string) => {
    if (!user) throw new Error('Not authenticated');

    // Remove user from house members
    await updateDoc(doc(db, 'houses', houseId), {
      members: arrayRemove(user.uid),
    });

    // Remove house from user's list
    await updateDoc(doc(db, 'users', user.uid), {
      houses: arrayRemove(houseId),
      ...(activeHouseId === houseId ? { activeHouseId: null } : {}),
    });
  };

  return (
    <HouseContext.Provider
      value={{
        activeHouse,
        activeHouseId,
        houses,
        userProfile,
        loading,
        createHouse,
        joinHouse,
        switchHouse,
        leaveHouse,
      }}
    >
      {children}
    </HouseContext.Provider>
  );
}

export function useHouse() {
  const ctx = useContext(HouseContext);
  if (!ctx) throw new Error('useHouse must be used within HouseProvider');
  return ctx;
}
