import { useShoppingListStore } from '../store/shoppingListStore';
import { useHouse } from '../contexts/HouseContext';
import { UnitType } from '../types';

export function useShoppingList() {
  const store = useShoppingListStore();
  const { activeHouseId } = useHouse();

  return {
    items: store.items,
    loading: store.loading,

    addItem: (name: string, quantity?: number, unit?: UnitType) =>
      activeHouseId ? store.addItem(activeHouseId, name, quantity, unit) : Promise.resolve(),

    toggleItem: (itemId: string, checked: boolean) =>
      activeHouseId ? store.toggleItem(activeHouseId, itemId, checked) : Promise.resolve(),

    removeItem: (itemId: string) =>
      activeHouseId ? store.removeItem(activeHouseId, itemId) : Promise.resolve(),

    clearChecked: () =>
      activeHouseId ? store.clearChecked(activeHouseId) : Promise.resolve(),
  };
}
