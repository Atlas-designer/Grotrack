import { create } from 'zustand';
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
  where,
  getDocs,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { ShoppingListItem, UnitType } from '../types';

interface ShoppingListState {
  items: ShoppingListItem[];
  loading: boolean;

  subscribe: (houseId: string) => () => void;
  addItem: (houseId: string, name: string, quantity?: number, unit?: UnitType) => Promise<void>;
  toggleItem: (houseId: string, itemId: string, checked: boolean) => Promise<void>;
  removeItem: (houseId: string, itemId: string) => Promise<void>;
  clearChecked: (houseId: string) => Promise<void>;
}

export const useShoppingListStore = create<ShoppingListState>()((set) => ({
  items: [],
  loading: true,

  subscribe: (houseId: string) => {
    set({ loading: true });
    const q = query(
      collection(db, 'houses', houseId, 'shoppingList'),
      orderBy('addedAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: ShoppingListItem[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ShoppingListItem[];
      set({ items, loading: false });
    });
    return unsubscribe;
  },

  addItem: async (houseId, name, quantity, unit) => {
    const colRef = collection(db, 'houses', houseId, 'shoppingList');
    await addDoc(colRef, {
      name,
      quantity: quantity || null,
      unit: unit || null,
      checked: false,
      addedBy: auth.currentUser?.uid || '',
      addedAt: new Date().toISOString(),
    });
  },

  toggleItem: async (houseId, itemId, checked) => {
    await updateDoc(doc(db, 'houses', houseId, 'shoppingList', itemId), {
      checked,
      ...(checked ? { checkedBy: auth.currentUser?.uid || '' } : { checkedBy: null }),
    });
  },

  removeItem: async (houseId, itemId) => {
    await deleteDoc(doc(db, 'houses', houseId, 'shoppingList', itemId));
  },

  clearChecked: async (houseId) => {
    const q = query(
      collection(db, 'houses', houseId, 'shoppingList'),
      where('checked', '==', true)
    );
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach((d) => {
      batch.delete(doc(db, 'houses', houseId, 'shoppingList', d.id));
    });
    await batch.commit();
  },
}));
