import { create } from 'zustand';
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  writeBatch,
  query,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { InventoryItem, CompartmentType, FoodCategory, EXPIRATION_DEFAULTS } from '../types';

const calculateExpirationDate = (category: FoodCategory): string => {
  const days = EXPIRATION_DEFAULTS[category];
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

interface InventoryState {
  items: InventoryItem[];
  searchQuery: string;
  loading: boolean;

  // Firestore sync
  subscribe: (houseId: string) => () => void;

  // Actions (write to Firestore, snapshot updates local state)
  addItem: (houseId: string, item: Omit<InventoryItem, 'id' | 'purchaseDate'>) => Promise<void>;
  removeItem: (houseId: string, itemId: string) => Promise<void>;
  updateItem: (houseId: string, itemId: string, updates: Partial<InventoryItem>) => Promise<void>;
  moveItem: (houseId: string, itemId: string, newCompartment: CompartmentType) => Promise<void>;
  setSearchQuery: (query: string) => void;
  getItemsByCompartment: (compartment: CompartmentType) => InventoryItem[];
  getExpiringItems: (daysThreshold?: number) => InventoryItem[];
  clearAll: (houseId: string) => Promise<void>;
}

export const useInventoryStore = create<InventoryState>()((set, get) => ({
  items: [],
  searchQuery: '',
  loading: true,

  subscribe: (houseId: string) => {
    set({ loading: true });
    const q = query(collection(db, 'houses', houseId, 'inventory'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: InventoryItem[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as InventoryItem[];
      set({ items, loading: false });
    });
    return unsubscribe;
  },

  addItem: async (houseId, itemData) => {
    const colRef = collection(db, 'houses', houseId, 'inventory');
    await addDoc(colRef, {
      ...itemData,
      purchaseDate: new Date().toISOString().split('T')[0],
      expirationDate: itemData.expirationDate || calculateExpirationDate(itemData.category),
      addedBy: auth.currentUser?.uid || '',
    });
  },

  removeItem: async (houseId, itemId) => {
    await deleteDoc(doc(db, 'houses', houseId, 'inventory', itemId));
  },

  updateItem: async (houseId, itemId, updates) => {
    await updateDoc(doc(db, 'houses', houseId, 'inventory', itemId), updates);
  },

  moveItem: async (houseId, itemId, newCompartment) => {
    await updateDoc(doc(db, 'houses', houseId, 'inventory', itemId), {
      compartment: newCompartment,
    });
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  getItemsByCompartment: (compartment) => {
    return get().items.filter((item) => item.compartment === compartment);
  },

  getExpiringItems: (daysThreshold = 7) => {
    const today = new Date();
    const threshold = new Date();
    threshold.setDate(today.getDate() + daysThreshold);

    return get().items.filter((item) => {
      const expDate = new Date(item.expirationDate);
      return expDate <= threshold && expDate >= today;
    });
  },

  clearAll: async (houseId) => {
    const items = get().items;
    const batch = writeBatch(db);
    items.forEach((item) => {
      batch.delete(doc(db, 'houses', houseId, 'inventory', item.id));
    });
    await batch.commit();
  },
}));
