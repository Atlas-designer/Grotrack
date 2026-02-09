import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, AlertTriangle, CheckSquare, ArrowRightLeft, X, LucideIcon, Palette } from 'lucide-react';
import { CompartmentType, InventoryItem, ItemLabel, DEFAULT_COMPARTMENTS } from '../../types';
import { useInventory } from '../../hooks/useInventory';
import { useHouse } from '../../contexts/HouseContext';
import { ItemCard } from './ItemCard';
import { ItemActionSheet } from './ItemActionSheet';
import { ItemDetailModal } from './ItemDetailModal';
import { ICON_MAP } from '../../utils/iconMap';
import { LABEL_COLORS } from '../../utils/labelColors';
import { Box } from 'lucide-react';

const DEFAULT_IDS = new Set(DEFAULT_COMPARTMENTS.map((c) => c.id));

interface CompartmentViewProps {
  compartment: CompartmentType;
  onBack: () => void;
  onAddItem: () => void;
}

export function CompartmentView({ compartment, onBack, onAddItem }: CompartmentViewProps) {
  const { items, moveItem, removeItem, updateItem } = useInventory();
  const { compartments, removeCompartment } = useHouse();
  const compartmentInfo = compartments.find((c) => c.id === compartment);
  const compartmentItems = items.filter((item) => item.compartment === compartment);
  const [moveItemSingle, setMoveItemSingle] = useState<InventoryItem | null>(null);
  const [detailItem, setDetailItem] = useState<InventoryItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Select mode state
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkMove, setShowBulkMove] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showBulkLabel, setShowBulkLabel] = useState(false);
  const [bulkActing, setBulkActing] = useState(false);

  const isCustom = !DEFAULT_IDS.has(compartment);

  const toggleSelect = (item: InventoryItem) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === compartmentItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(compartmentItems.map((i) => i.id)));
    }
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
    setShowBulkMove(false);
    setShowBulkDeleteConfirm(false);
    setShowBulkLabel(false);
  };

  const handleBulkMove = async (targetCompartment: string) => {
    setBulkActing(true);
    try {
      for (const id of selectedIds) {
        await moveItem(id, targetCompartment);
      }
      exitSelectMode();
    } finally {
      setBulkActing(false);
    }
  };

  const handleBulkDelete = async () => {
    setBulkActing(true);
    try {
      for (const id of selectedIds) {
        await removeItem(id);
      }
      exitSelectMode();
    } finally {
      setBulkActing(false);
    }
  };

  const handleBulkLabel = async (label: ItemLabel | undefined) => {
    setBulkActing(true);
    try {
      for (const id of selectedIds) {
        await updateItem(id, { label: label || undefined });
      }
      setShowBulkLabel(false);
    } finally {
      setBulkActing(false);
    }
  };

  const handleDeleteCompartment = async () => {
    setDeleting(true);
    try {
      await removeCompartment(compartment);
      onBack();
    } finally {
      setDeleting(false);
    }
  };

  const otherCompartments = compartments.filter((c) => c.id !== compartment);

  return (
    <div className="min-h-screen bg-navy-950">
      <header className="sticky top-0 z-40 bg-navy-900/80 backdrop-blur-lg border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {selectMode ? (
              <button
                onClick={exitSelectMode}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                aria-label="Exit select mode"
              >
                <X size={22} className="text-gray-400" />
              </button>
            ) : (
              <button
                onClick={onBack}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft size={22} className="text-gray-400" />
              </button>
            )}
            <div>
              <h1 className="text-lg font-bold text-white">
                {selectMode ? `${selectedIds.size} selected` : compartmentInfo?.name}
              </h1>
              {!selectMode && (
                <p className="text-sm text-gray-500">
                  {compartmentItems.length} {compartmentItems.length === 1 ? 'item' : 'items'}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {selectMode ? (
              <button
                onClick={toggleSelectAll}
                className="px-3 py-2 text-xs font-medium text-accent-400 hover:bg-accent-400/10 rounded-xl transition-colors"
              >
                {selectedIds.size === compartmentItems.length ? 'Deselect All' : 'Select All'}
              </button>
            ) : (
              <>
                {compartmentItems.length > 0 && (
                  <button
                    onClick={() => setSelectMode(true)}
                    className="p-2.5 text-gray-500 hover:text-accent-400 hover:bg-white/5 rounded-xl transition-colors"
                    aria-label="Select items"
                  >
                    <CheckSquare size={18} />
                  </button>
                )}
                {isCustom && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                    aria-label="Delete compartment"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                <button
                  onClick={onAddItem}
                  className="p-2.5 bg-accent-400 text-navy-950 rounded-xl hover:bg-accent-300 transition-colors"
                  aria-label="Add item"
                >
                  <Plus size={20} strokeWidth={2.5} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className={`p-4 ${selectMode ? 'pb-32' : 'pb-24'}`}>
        {compartmentItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">No items in {compartmentInfo?.name}</p>
            <button
              onClick={onAddItem}
              className="px-5 py-2.5 bg-accent-400 text-navy-950 font-medium rounded-xl hover:bg-accent-300 transition-colors"
            >
              Add your first item
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {compartmentItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onMove={selectMode ? undefined : setMoveItemSingle}
                onClick={selectMode ? undefined : setDetailItem}
                selectMode={selectMode}
                selected={selectedIds.has(item.id)}
                onToggleSelect={toggleSelect}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom action bar for select mode */}
      {selectMode && selectedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-navy-900/95 backdrop-blur-lg border-t border-white/10 px-4 py-3 flex gap-3">
          <button
            onClick={() => setShowBulkMove(true)}
            className="flex-1 py-3 bg-accent-400 text-navy-950 font-semibold rounded-xl hover:bg-accent-300 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowRightLeft size={16} />
            Move
          </button>
          <button
            onClick={() => setShowBulkLabel(true)}
            className="py-3 px-5 bg-navy-800 border border-white/10 text-white font-semibold rounded-xl hover:bg-navy-700 transition-colors flex items-center justify-center gap-2"
          >
            <Palette size={16} />
            Label
          </button>
          <button
            onClick={() => setShowBulkDeleteConfirm(true)}
            className="py-3 px-5 bg-red-500/15 text-red-400 font-semibold rounded-xl hover:bg-red-500/25 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {/* Single item move sheet */}
      {moveItemSingle && (
        <ItemActionSheet item={moveItemSingle} onClose={() => setMoveItemSingle(null)} />
      )}

      {detailItem && (
        <ItemDetailModal item={detailItem} onClose={() => setDetailItem(null)} />
      )}

      {/* Bulk move sheet */}
      {showBulkMove && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowBulkMove(false)} />
          <div className="relative bg-navy-900 w-full sm:max-w-md rounded-t-2xl border border-white/10 max-h-[70vh] overflow-y-auto">
            <div className="sticky top-0 bg-navy-900 border-b border-white/5 px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Move {selectedIds.size} {selectedIds.size === 1 ? 'item' : 'items'}
              </h2>
              <button onClick={() => setShowBulkMove(false)} className="p-2 hover:bg-white/10 rounded-xl flex-shrink-0">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowRightLeft size={14} className="text-gray-400" />
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Move to</p>
              </div>
              <div className="space-y-1.5">
                {otherCompartments.map((comp) => {
                  const Icon: LucideIcon = ICON_MAP[comp.icon] || Box;
                  return (
                    <button
                      key={comp.id}
                      onClick={() => handleBulkMove(comp.id)}
                      disabled={bulkActing}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-navy-700/50 hover:bg-navy-700 transition-colors disabled:opacity-50 active:scale-[0.98]"
                    >
                      <div className={`w-9 h-9 ${comp.bgColor} rounded-lg flex items-center justify-center`}>
                        <Icon size={18} className={comp.color} />
                      </div>
                      <span className="text-sm font-medium text-white">{comp.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="h-6" />
          </div>
        </div>
      )}

      {/* Bulk label picker */}
      {showBulkLabel && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowBulkLabel(false)} />
          <div className="relative bg-navy-900 w-full sm:max-w-md rounded-t-2xl border border-white/10">
            <div className="sticky top-0 bg-navy-900 border-b border-white/5 px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Label {selectedIds.size} {selectedIds.size === 1 ? 'item' : 'items'}
              </h2>
              <button onClick={() => setShowBulkLabel(false)} className="p-2 hover:bg-white/10 rounded-xl flex-shrink-0">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              <button
                onClick={() => handleBulkLabel(undefined)}
                disabled={bulkActing}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-navy-700/50 hover:bg-navy-700 transition-colors disabled:opacity-50 active:scale-[0.98]"
              >
                <div className="w-6 h-6 rounded-full border-2 border-gray-600 flex items-center justify-center">
                  <X size={10} className="text-gray-500" />
                </div>
                <span className="text-sm font-medium text-gray-400">No label</span>
              </button>
              {LABEL_COLORS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleBulkLabel(c.id)}
                  disabled={bulkActing}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-navy-700/50 hover:bg-navy-700 transition-colors disabled:opacity-50 active:scale-[0.98]"
                >
                  <div className={`w-6 h-6 rounded-full ${c.dot}`} />
                  <span className="text-sm font-medium text-white">{c.name}</span>
                </button>
              ))}
            </div>
            <div className="h-6" />
          </div>
        </div>
      )}

      {/* Bulk delete confirmation */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowBulkDeleteConfirm(false)} />
          <div className="relative bg-navy-900 w-full max-w-sm mx-4 rounded-2xl border border-white/10 p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-red-400/15 rounded-lg flex-shrink-0">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Delete {selectedIds.size} {selectedIds.size === 1 ? 'item' : 'items'}?</h3>
                <p className="text-sm text-gray-400 mt-1">
                  This will permanently remove the selected items from your inventory.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="flex-1 py-2.5 bg-navy-700 border border-white/10 text-white text-sm font-medium rounded-xl hover:bg-navy-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkActing}
                className="flex-1 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-400 transition-colors disabled:opacity-50"
              >
                {bulkActing ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete compartment confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-navy-900 w-full max-w-sm mx-4 rounded-2xl border border-white/10 p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-red-400/15 rounded-lg flex-shrink-0">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Delete "{compartmentInfo?.name}"?</h3>
                <p className="text-sm text-gray-400 mt-1">
                  This compartment will be removed. {compartmentItems.length > 0
                    ? `The ${compartmentItems.length} item${compartmentItems.length !== 1 ? 's' : ''} inside will remain but won't be visible until moved.`
                    : 'It has no items.'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 bg-navy-700 border border-white/10 text-white text-sm font-medium rounded-xl hover:bg-navy-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCompartment}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-400 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
