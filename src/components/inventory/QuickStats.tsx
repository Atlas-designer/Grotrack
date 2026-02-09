import { Package, AlertTriangle, ShoppingCart } from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';

interface QuickStatsProps {
  onTotalClick?: () => void;
}

export function QuickStats({ onTotalClick }: QuickStatsProps) {
  const { items, getExpiringItems } = useInventory();
  const expiringCount = getExpiringItems(7).length;

  const stats = [
    {
      icon: Package,
      label: 'Total Items',
      value: items.length,
      color: 'text-accent-400',
      bgColor: 'bg-accent-400/15',
      onClick: onTotalClick,
    },
    {
      icon: AlertTriangle,
      label: 'Expiring Soon',
      value: expiringCount,
      color: 'text-amber-400',
      bgColor: 'bg-amber-400/15',
    },
    {
      icon: ShoppingCart,
      label: 'Categories',
      value: new Set(items.map((i) => i.category)).size,
      color: 'text-violet-400',
      bgColor: 'bg-violet-400/15',
    },
  ];

  return (
    <div className="px-4 py-3">
      <div className="flex gap-3 overflow-x-auto pb-1">
        {stats.map((stat) => (
          <div
            key={stat.label}
            onClick={stat.onClick}
            className={`flex-1 min-w-[100px] bg-navy-800 rounded-2xl p-4 border border-white/5 ${
              stat.onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''
            }`}
          >
            <div
              className={`w-9 h-9 ${stat.bgColor} rounded-xl flex items-center justify-center mb-3`}
            >
              <stat.icon size={18} className={stat.color} />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
