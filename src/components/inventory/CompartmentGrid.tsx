import { useState } from 'react';
import {
  Refrigerator,
  Snowflake,
  Home,
  Cookie,
  Wheat,
  Droplets,
  Wine,
  Coffee,
  Apple,
  ShoppingBag,
  Box,
  Leaf,
  Beef,
  Fish,
  Plus,
  LucideIcon,
  Pill,
} from 'lucide-react';
import { CompartmentType } from '../../types';
import { useInventory } from '../../hooks/useInventory';
import { useHouse } from '../../contexts/HouseContext';
import { AddCompartmentModal } from './AddCompartmentModal';

export const ICON_MAP: Record<string, LucideIcon> = {
  Refrigerator,
  Snowflake,
  Home,
  Cookie,
  Wheat,
  Droplets,
  Wine,
  Coffee,
  Apple,
  ShoppingBag,
  Box,
  Pill,
  Leaf,
  Beef,
  Fish,
};

interface CompartmentGridProps {
  onCompartmentClick: (compartment: CompartmentType) => void;
}

export function CompartmentGrid({ onCompartmentClick }: CompartmentGridProps) {
  const { items } = useInventory();
  const { compartments } = useHouse();
  const [showAddModal, setShowAddModal] = useState(false);

  const getItemCount = (compartmentId: string) => {
    return items.filter((item) => item.compartment === compartmentId).length;
  };

  return (
    <div className="px-4 pb-4">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Compartments
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {compartments.map((compartment) => {
          const IconComponent = ICON_MAP[compartment.icon] || Box;
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

        {/* Add compartment card */}
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-navy-800 border-2 border-dashed border-white/10 p-5 rounded-2xl flex flex-col items-start gap-3 hover:border-accent-400/30 transition-colors active:scale-95"
        >
          <div className="w-11 h-11 bg-white/5 rounded-xl flex items-center justify-center">
            <Plus size={24} className="text-gray-500" />
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-500 block">
              Add New
            </span>
            <span className="text-xs text-gray-600">
              Compartment
            </span>
          </div>
        </button>
      </div>

      <AddCompartmentModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
}
