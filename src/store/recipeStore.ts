import { create } from 'zustand';
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  setDoc,
  query,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Recipe } from '../types';

interface RecipeState {
  customRecipes: Recipe[];
  hiddenBuiltInIds: string[];
  loading: boolean;

  subscribe: (houseId: string) => () => void;
  addRecipe: (houseId: string, recipe: Omit<Recipe, 'id' | 'source' | 'createdBy' | 'createdAt'>) => Promise<void>;
  updateRecipe: (houseId: string, recipeId: string, updates: Partial<Recipe>) => Promise<void>;
  deleteRecipe: (houseId: string, recipeId: string) => Promise<void>;
  hideBuiltInRecipe: (houseId: string, builtInId: string) => Promise<void>;
  saveBuiltInAsCustom: (houseId: string, recipe: Recipe, updates: Partial<Recipe>) => Promise<void>;
}

export const useRecipeStore = create<RecipeState>()((set, get) => ({
  customRecipes: [],
  hiddenBuiltInIds: [],
  loading: true,

  subscribe: (houseId: string) => {
    set({ loading: true });
    const q = query(collection(db, 'houses', houseId, 'recipes'));
    const unsubRecipes = onSnapshot(q, (snapshot) => {
      const recipes: Recipe[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Recipe[];
      set({ customRecipes: recipes, loading: false });
    });

    // Also listen to hidden built-in IDs
    const hiddenRef = doc(db, 'houses', houseId, 'recipeSettings', 'hidden');
    const unsubHidden = onSnapshot(hiddenRef, (snap) => {
      if (snap.exists()) {
        set({ hiddenBuiltInIds: (snap.data().ids as string[]) || [] });
      } else {
        set({ hiddenBuiltInIds: [] });
      }
    });

    return () => {
      unsubRecipes();
      unsubHidden();
    };
  },

  addRecipe: async (houseId, recipeData) => {
    const colRef = collection(db, 'houses', houseId, 'recipes');
    await addDoc(colRef, {
      ...recipeData,
      source: 'custom',
      createdBy: auth.currentUser?.uid || '',
      createdAt: new Date().toISOString(),
    });
  },

  updateRecipe: async (houseId, recipeId, updates) => {
    await updateDoc(doc(db, 'houses', houseId, 'recipes', recipeId), updates);
  },

  deleteRecipe: async (houseId, recipeId) => {
    await deleteDoc(doc(db, 'houses', houseId, 'recipes', recipeId));
  },

  hideBuiltInRecipe: async (houseId, builtInId) => {
    const hiddenRef = doc(db, 'houses', houseId, 'recipeSettings', 'hidden');
    const current = get().hiddenBuiltInIds;
    const updated = [...new Set([...current, builtInId])];
    await setDoc(hiddenRef, { ids: updated });
  },

  saveBuiltInAsCustom: async (houseId, recipe, updates) => {
    const colRef = collection(db, 'houses', houseId, 'recipes');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, source, createdBy, createdAt, ...recipeData } = recipe;
    await addDoc(colRef, {
      ...recipeData,
      ...updates,
      builtInId: id,
      source: 'custom',
      createdBy: auth.currentUser?.uid || '',
      createdAt: new Date().toISOString(),
    });
    // Hide the original built-in
    const hiddenRef = doc(db, 'houses', houseId, 'recipeSettings', 'hidden');
    const current = get().hiddenBuiltInIds;
    const updatedIds = [...new Set([...current, id])];
    await setDoc(hiddenRef, { ids: updatedIds });
  },
}));
