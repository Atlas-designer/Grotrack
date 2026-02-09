import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useHouse } from './contexts/HouseContext';
import { useInventoryStore } from './store/inventoryStore';
import { useShoppingListStore } from './store/shoppingListStore';
import { useRecipeStore } from './store/recipeStore';
import { AuthScreen } from './components/auth/AuthScreen';
import { HouseSetup } from './components/house/HouseSetup';
import { Header } from './components/layout/Header';
import { BottomNav, NavTab } from './components/layout/BottomNav';
import { SearchOverlay } from './components/layout/SearchOverlay';
import { CompartmentGrid } from './components/inventory/CompartmentGrid';
import { CompartmentView } from './components/inventory/CompartmentView';
import { AddItemModal } from './components/inventory/AddItemModal';
import { ExpiringBanner } from './components/inventory/ExpiringBanner';
import { QuickStats } from './components/inventory/QuickStats';
import { ShoppingListView } from './components/shopping/ShoppingListView';
import { RecipesView } from './components/recipes/RecipesView';
import { ProfileView } from './components/profile/ProfileView';
import { ReceiptScanner } from './components/scanner/ReceiptScanner';
import { CompartmentType } from './types';
import { migrateLocalInventory } from './utils/migrateLocalData';
import { Loader2 } from 'lucide-react';

function SplashScreen() {
  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 bg-accent-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <span className="text-navy-950 font-bold text-xl">G</span>
        </div>
        <Loader2 size={24} className="text-accent-400 animate-spin mx-auto mt-4" />
      </div>
    </div>
  );
}

function AppContent() {
  const { activeHouseId } = useHouse();
  const inventorySubscribe = useInventoryStore((s) => s.subscribe);
  const shoppingSubscribe = useShoppingListStore((s) => s.subscribe);
  const recipeSubscribe = useRecipeStore((s) => s.subscribe);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedCompartment, setSelectedCompartment] = useState<CompartmentType | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  // Subscribe to Firestore collections when house is active
  useEffect(() => {
    if (!activeHouseId) return;
    const unsubInventory = inventorySubscribe(activeHouseId);
    const unsubShopping = shoppingSubscribe(activeHouseId);
    const unsubRecipes = recipeSubscribe(activeHouseId);
    return () => {
      unsubInventory();
      unsubShopping();
      unsubRecipes();
    };
  }, [activeHouseId]);

  // One-time migration of localStorage data
  useEffect(() => {
    if (!activeHouseId) return;
    migrateLocalInventory(activeHouseId).then((count) => {
      if (count > 0) {
        console.log(`Migrated ${count} items from local storage to Firestore`);
      }
    });
  }, [activeHouseId]);

  // Reset compartment view when switching tabs
  useEffect(() => {
    if (activeTab !== 'home') {
      setSelectedCompartment(null);
    }
  }, [activeTab]);

  // Compartment detail view
  if (selectedCompartment && activeTab === 'home') {
    return (
      <>
        <CompartmentView
          compartment={selectedCompartment}
          onBack={() => setSelectedCompartment(null)}
          onAddItem={() => setIsAddModalOpen(true)}
        />
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        <AddItemModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          defaultCompartment={selectedCompartment}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950 pb-20">
      {activeTab === 'home' && (
        <>
          <Header
            onSearchClick={() => setIsSearchOpen(true)}
            onAddClick={() => setIsAddModalOpen(true)}
            onScanClick={() => setIsScannerOpen(true)}
          />
          <ExpiringBanner />
          <QuickStats />
          <CompartmentGrid onCompartmentClick={setSelectedCompartment} />
          <SearchOverlay
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
          />
          <AddItemModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
          />
        </>
      )}

      {activeTab === 'lists' && <ShoppingListView />}
      {activeTab === 'recipes' && <RecipesView />}
      {activeTab === 'profile' && <ProfileView />}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <ReceiptScanner isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
    </div>
  );
}

function App() {
  const { user, loading: authLoading } = useAuth();
  const { activeHouseId, loading: houseLoading } = useHouse();

  // Show splash while auth is resolving
  if (authLoading) return <SplashScreen />;

  // Not logged in
  if (!user) return <AuthScreen />;

  // Auth resolved but house context still loading
  if (houseLoading) return <SplashScreen />;

  // No house selected yet
  if (!activeHouseId) return <HouseSetup />;

  // Main app
  return <AppContent />;
}

export default App;
