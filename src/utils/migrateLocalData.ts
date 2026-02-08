import { collection, writeBatch, doc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { InventoryItem } from '../types';

export async function migrateLocalInventory(houseId: string): Promise<number> {
  const raw = localStorage.getItem('grotrack-inventory');
  if (!raw) return 0;

  try {
    const parsed = JSON.parse(raw);
    const items: InventoryItem[] = parsed?.state?.items || [];
    if (items.length === 0) return 0;

    const batch = writeBatch(db);
    for (const item of items) {
      const ref = doc(collection(db, 'houses', houseId, 'inventory'));
      const { id, ...itemData } = item; // strip the old local id
      batch.set(ref, {
        ...itemData,
        addedBy: auth.currentUser?.uid || '',
      });
    }
    await batch.commit();

    // Clear old localStorage data
    localStorage.removeItem('grotrack-inventory');

    return items.length;
  } catch {
    return 0;
  }
}
