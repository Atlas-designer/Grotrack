import {
  Refrigerator,
  Snowflake,
  Home,
  Cookie,
  Wheat,
  Droplets
} from 'lucide-react';
import { DEFAULT_COMPARTMENTS, CompartmentType } from '../../types';
import { useInventory } from '../../hooks/useInventory';

const iconMap = {
  Refrigerator,
  Snowflake,
  Home,
  Cookie,
  Wheat,
  Droplets,
};

interface CompartmentGridProps {
  onCompartmentClick: (compartment: CompartmentType) => void;
}

export function CompartmentGrid({ onCompartmentClick }: CompartmentGridProps) {
  const { items } = useInventory();

  const getItemCount = (compartmentId: CompartmentType) => {
    return items.filter((item) => item.compartment === compartmentId).length;
  };

  return (
    <div className="px-4 pb-4">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Compartments
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {DEFAULT_COMPARTMENTS.map((compartment) => {
          const IconComponent = iconMap[compartment.icon as keyof typeof iconMap];
          const itemCount = getItemCount(compartment.id);

          return (
            <button
              key={compartment.id}
              onClick={() => onCompartmentClick(compartment.id)}
              className={`${compartment.bgColor} p-5 rounded-2xl flex flex-col items-start gap-3 card-hover active:scale-95`}
            >
              <div className={`w-11 h-11 bg-white/60 rounded-xl flex items-center justify-center ${compartment.color}`}>
                <IconComponent size={24} />
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-800 block">
                  {compartment.name}
                </span>
                <span className="text-xs text-gray-500">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
