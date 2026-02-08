import { Search, Plus, ScanLine } from 'lucide-react';

interface HeaderProps {
  onSearchClick: () => void;
  onAddClick: () => void;
  onScanClick: () => void;
}

export function Header({ onSearchClick, onAddClick, onScanClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-navy-900/80 backdrop-blur-lg border-b border-white/5">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-accent-400 rounded-xl flex items-center justify-center">
            <span className="text-navy-950 font-bold text-lg">G</span>
          </div>
          <h1 className="text-xl font-bold text-white">Grotrack</h1>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onScanClick}
            className="p-2.5 hover:bg-white/10 rounded-xl transition-colors"
            aria-label="Scan receipt"
          >
            <ScanLine size={20} className="text-gray-400" />
          </button>
          <button
            onClick={onSearchClick}
            className="p-2.5 hover:bg-white/10 rounded-xl transition-colors"
            aria-label="Search"
          >
            <Search size={20} className="text-gray-400" />
          </button>
          <button
            onClick={onAddClick}
            className="p-2.5 bg-accent-400 text-navy-950 rounded-xl hover:bg-accent-300 transition-colors"
            aria-label="Add item"
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </header>
  );
}
