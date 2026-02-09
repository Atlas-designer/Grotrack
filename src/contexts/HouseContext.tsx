import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { House, UserProfile, Compartment, FoodInfo, DEFAULT_COMPARTMENTS } from '../types';

interface HouseContextValue {
  activeHouse: House | null;
  activeHouseId: string | null;
  houses: House[];
  userProfile: UserProfile | null;
  loading: boolean;
  compartments: Compartment[];
  foodMappings: Record<string, FoodInfo>;
  nameCorrections: Record<string, string>;
  imageCache: Record<string, string>;
  createHouse: (name: string) => Promise<string>;
  joinHouse: (inviteCode: string) => Promise<void>;
  switchHouse: (houseId: string) => Promise<void>;
  leaveHouse: (houseId: string) => Promise<void>;
  deleteHouse: (houseId: string) => Promise<void>;
  removeMember: (houseId: string, memberUid: string) => Promise<void>;
  addCompartment: (compartment: Omit<Compartment, 'id'>) => Promise<void>;
  removeCompartment: (compartmentId: string) => Promise<void>;
  saveFoodMapping: (itemName: string, info: FoodInfo) => Promise<void>;
  saveNameCorrection: (original: string, corrected: string) => Promise<void>;
  saveImageCache: (entries: Record<string, string>) => Promise<void>;
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

function generateCompartmentId(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36);
}

export function HouseProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeHouse, setActiveHouse] = useState<House | null>(null);
  const [activeHouseId, setActiveHouseId] = useState<string | null>(null);
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);

  // Derive compartments from active house or fall back to defaults
  const compartments = activeHouse?.compartments ?? DEFAULT_COMPARTMENTS;

  // Derive food mappings from active house
  const foodMappings = activeHouse?.foodMappings ?? {};
  const nameCorrections = activeHouse?.nameCorrections ?? {};
  const imageCache = activeHouse?.imageCache ?? {};

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
      compartments: DEFAULT_COMPARTMENTS,
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

  const deleteHouse = async (houseId: string) => {
    if (!user) throw new Error('Not authenticated');

    // Verify ownership
    const houseSnap = await getDoc(doc(db, 'houses', houseId));
    if (!houseSnap.exists()) throw new Error('House not found');
    const houseData = houseSnap.data();
    if (houseData.createdBy !== user.uid) throw new Error('Only the house creator can delete it');

    const members: string[] = houseData.members || [];

    // Remove house from all members' profiles
    for (const memberUid of members) {
      const memberRef = doc(db, 'users', memberUid);
      const memberSnap = await getDoc(memberRef);
      if (memberSnap.exists()) {
        const memberData = memberSnap.data() as UserProfile;
        const updates: Record<string, unknown> = { houses: arrayRemove(houseId) };
        if (memberData.activeHouseId === houseId) {
          const remaining = memberData.houses.filter((h) => h !== houseId);
          updates.activeHouseId = remaining.length > 0 ? remaining[0] : null;
        }
        await updateDoc(memberRef, updates);
      }
    }

    // Delete inventory subcollection
    const inventorySnap = await getDocs(collection(db, 'houses', houseId, 'inventory'));
    if (!inventorySnap.empty) {
      const batch = writeBatch(db);
      inventorySnap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }

    // Delete shopping list subcollection
    const shoppingSnap = await getDocs(collection(db, 'houses', houseId, 'shoppingList'));
    if (!shoppingSnap.empty) {
      const batch = writeBatch(db);
      shoppingSnap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }

    // Delete house doc
    await deleteDoc(doc(db, 'houses', houseId));
  };

  const removeMember = async (houseId: string, memberUid: string) => {
    if (!user) throw new Error('Not authenticated');

    // Verify ownership
    const houseSnap = await getDoc(doc(db, 'houses', houseId));
    if (!houseSnap.exists()) throw new Error('House not found');
    if (houseSnap.data().createdBy !== user.uid) throw new Error('Only the house creator can remove members');
    if (memberUid === user.uid) throw new Error('Cannot remove yourself');

    // Remove member from house
    await updateDoc(doc(db, 'houses', houseId), {
      members: arrayRemove(memberUid),
    });

    // Remove house from member's profile
    const memberRef = doc(db, 'users', memberUid);
    const memberSnap = await getDoc(memberRef);
    if (memberSnap.exists()) {
      const memberData = memberSnap.data() as UserProfile;
      const updates: Record<string, unknown> = { houses: arrayRemove(houseId) };
      if (memberData.activeHouseId === houseId) {
        const remaining = memberData.houses.filter((h) => h !== houseId);
        updates.activeHouseId = remaining.length > 0 ? remaining[0] : null;
      }
      await updateDoc(memberRef, updates);
    }
  };

  const addCompartment = async (compartment: Omit<Compartment, 'id'>) => {
    if (!user || !activeHouseId) throw new Error('Not authenticated or no active house');

    const newCompartment: Compartment = {
      id: generateCompartmentId(compartment.name),
      ...compartment,
    };

    const current = activeHouse?.compartments ?? DEFAULT_COMPARTMENTS;
    await updateDoc(doc(db, 'houses', activeHouseId), {
      compartments: [...current, newCompartment],
    });
  };

  const removeCompartment = async (compartmentId: string) => {
    if (!user || !activeHouseId) throw new Error('Not authenticated or no active house');

    const current = activeHouse?.compartments ?? DEFAULT_COMPARTMENTS;
    const updated = current.filter((c) => c.id !== compartmentId);
    await updateDoc(doc(db, 'houses', activeHouseId), {
      compartments: updated,
    });
  };

  const saveFoodMapping = async (itemName: string, info: FoodInfo) => {
    if (!user || !activeHouseId) throw new Error('Not authenticated or no active house');
    const current = activeHouse?.foodMappings ?? {};
    await updateDoc(doc(db, 'houses', activeHouseId), {
      foodMappings: { ...current, [itemName.toLowerCase().trim()]: info },
    });
  };

  const saveNameCorrection = async (original: string, corrected: string) => {
    if (!user || !activeHouseId) throw new Error('Not authenticated or no active house');
    const current = activeHouse?.nameCorrections ?? {};
    await updateDoc(doc(db, 'houses', activeHouseId), {
      nameCorrections: { ...current, [original.toLowerCase().trim()]: corrected },
    });
  };

  const saveImageCache = async (entries: Record<string, string>) => {
    if (!user || !activeHouseId) throw new Error('Not authenticated or no active house');
    const current = activeHouse?.imageCache ?? {};
    await updateDoc(doc(db, 'houses', activeHouseId), {
      imageCache: { ...current, ...entries },
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
        compartments,
        foodMappings,
        nameCorrections,
        imageCache,
        createHouse,
        joinHouse,
        switchHouse,
        leaveHouse,
        deleteHouse,
        removeMember,
        addCompartment,
        removeCompartment,
        saveFoodMapping,
        saveNameCorrection,
        saveImageCache,
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
