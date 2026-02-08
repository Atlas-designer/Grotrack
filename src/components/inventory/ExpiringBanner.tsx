import { AlertTriangle } from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';

export function ExpiringBanner() {
  const { getExpiringItems } = useInventory();
  const expiringItems = getExpiringItems(3);

  if (expiringItems.length === 0) return null;

  return (
    <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
      <div className="p-2 bg-red-500/20 rounded-xl">
        <AlertTriangle size={20} className="text-red-400" />
      </div>
      <div>
        <p className="font-medium text-red-300 text-sm">
          {expiringItems.length} {expiringItems.length === 1 ? 'item' : 'items'} expiring soon!
        </p>
        <p className="text-xs text-red-400/70">
          {expiringItems.slice(0, 3).map((item) => item.name).join(', ')}
          {expiringItems.length > 3 && ` +${expiringItems.length - 3} more`}
        </p>
      </div>
    </div>
  );
}
