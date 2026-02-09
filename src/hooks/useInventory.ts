import { doc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useInventoryStore } from '../store/inventoryStore';
import { useHouse } from '../contexts/HouseContext';
import { InventoryItem, CompartmentType, Compartment } from '../types';

function isFreezerCompartment(compartmentId: string, compartments: Compartment[]): boolean {
  if (compartmentId === 'freezer') return true;
  const comp = compartments.find((c) => c.id === compartmentId);
  if (!comp) return false;
  return comp.icon === 'Snowflake' || comp.name.toLowerCase().includes('freezer');
}

export function useInventory() {
  const store = useInventoryStore();
  const { activeHouseId, compartments } = useHouse();

  return {
    items: store.items,
    loading: store.loading,
    searchQuery: store.searchQuery,
    setSearchQuery: store.setSearchQuery,
    getItemsByCompartment: store.getItemsByCompartment,
    getExpiringItems: store.getExpiringItems,

    addItem: (item: Omit<InventoryItem, 'id' | 'purchaseDate'>) =>
      activeHouseId ? store.addItem(activeHouseId, item) : Promise.resolve(),

    removeItem: (id: string) =>
      activeHouseId ? store.removeItem(activeHouseId, id) : Promise.resolve(),

    updateItem: (id: string, updates: Partial<InventoryItem>) =>
      activeHouseId ? store.updateItem(activeHouseId, id, updates) : Promise.resolve(),

    moveItem: async (id: string, newCompartment: CompartmentType) => {
      if (!activeHouseId) return;

      const item = store.items.find((i) => i.id === id);
      if (!item) return;

      const toFreezer = isFreezerCompartment(newCompartment, compartments);
      const fromFreezer = isFreezerCompartment(item.compartment, compartments);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updates: Record<string, any> = { compartment: newCompartment };

      if (toFreezer && !fromFreezer) {
        // Moving TO freezer: save remaining days so expiry is "frozen"
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiry = new Date(item.expirationDate);
        const daysRemaining = Math.max(1, Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
        updates.frozenDaysRemaining = daysRemaining;
      } else if (fromFreezer && !toFreezer && item.frozenDaysRemaining) {
        // Moving FROM freezer: restore expiry based on frozen days remaining
        const date = new Date();
        date.setDate(date.getDate() + item.frozenDaysRemaining);
        updates.expirationDate = date.toISOString().split('T')[0];
        updates.frozenDaysRemaining = deleteField();
      }

      await updateDoc(doc(db, 'houses', activeHouseId, 'inventory', id), updates);
    },

    clearAll: () =>
      activeHouseId ? store.clearAll(activeHouseId) : Promise.resolve(),

    clearCompartment: (compartment: CompartmentType) =>
      activeHouseId ? store.clearCompartment(activeHouseId, compartment) : Promise.resolve(),

    batchAddItems: (items: Omit<InventoryItem, 'id' | 'purchaseDate'>[]) =>
      activeHouseId ? store.batchAddItems(activeHouseId, items) : Promise.resolve(),
  };
}
