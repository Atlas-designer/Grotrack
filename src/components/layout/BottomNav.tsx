import { Home, ClipboardList, User } from 'lucide-react';

export type NavTab = 'home' | 'lists' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

const tabs: { id: NavTab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'lists', label: 'Lists', icon: ClipboardList },
  { id: 'profile', label: 'Profile', icon: User },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-navy-900/90 backdrop-blur-lg border-t border-white/5">
      <div className="flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors"
            >
              <tab.icon
                size={22}
                className={isActive ? 'text-accent-400' : 'text-gray-500'}
              />
              <span
                className={`text-[10px] font-medium ${
                  isActive ? 'text-accent-400' : 'text-gray-500'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
