import { create } from 'zustand';
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Recipe } from '../types';

interface RecipeState {
  customRecipes: Recipe[];
  loading: boolean;

  subscribe: (houseId: string) => () => void;
  addRecipe: (houseId: string, recipe: Omit<Recipe, 'id' | 'source' | 'createdBy' | 'createdAt'>) => Promise<void>;
  updateRecipe: (houseId: string, recipeId: string, updates: Partial<Recipe>) => Promise<void>;
  deleteRecipe: (houseId: string, recipeId: string) => Promise<void>;
}

export const useRecipeStore = create<RecipeState>()((set) => ({
  customRecipes: [],
  loading: true,

  subscribe: (houseId: string) => {
    set({ loading: true });
    const q = query(collection(db, 'houses', houseId, 'recipes'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const recipes: Recipe[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Recipe[];
      set({ customRecipes: recipes, loading: false });
    });
    return unsubscribe;
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
}));
