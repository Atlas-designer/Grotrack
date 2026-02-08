import { useInventoryStore } from '../store/inventoryStore';
import { useHouse } from '../contexts/HouseContext';
import { InventoryItem, CompartmentType } from '../types';

export function useInventory() {
  const store = useInventoryStore();
  const { activeHouseId } = useHouse();

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

    moveItem: (id: string, compartment: CompartmentType) =>
      activeHouseId ? store.moveItem(activeHouseId, id, compartment) : Promise.resolve(),

    clearAll: () =>
      activeHouseId ? store.clearAll(activeHouseId) : Promise.resolve(),
  };
}
