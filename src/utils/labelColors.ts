import { ItemLabel } from '../types';

export interface LabelColor {
  id: ItemLabel;
  name: string;
  dot: string;      // bg class for the small dot
  bg: string;        // bg class for card highlight
  border: string;    // border class for card
}

export const LABEL_COLORS: LabelColor[] = [
  { id: 'red', name: 'Red', dot: 'bg-red-400', bg: 'bg-red-400/5', border: 'border-red-400/30' },
  { id: 'orange', name: 'Orange', dot: 'bg-orange-400', bg: 'bg-orange-400/5', border: 'border-orange-400/30' },
  { id: 'yellow', name: 'Yellow', dot: 'bg-yellow-400', bg: 'bg-yellow-400/5', border: 'border-yellow-400/30' },
  { id: 'green', name: 'Green', dot: 'bg-emerald-400', bg: 'bg-emerald-400/5', border: 'border-emerald-400/30' },
  { id: 'blue', name: 'Blue', dot: 'bg-blue-400', bg: 'bg-blue-400/5', border: 'border-blue-400/30' },
  { id: 'purple', name: 'Purple', dot: 'bg-violet-400', bg: 'bg-violet-400/5', border: 'border-violet-400/30' },
  { id: 'pink', name: 'Pink', dot: 'bg-pink-400', bg: 'bg-pink-400/5', border: 'border-pink-400/30' },
];

export function getLabelColor(label?: ItemLabel): LabelColor | undefined {
  if (!label) return undefined;
  return LABEL_COLORS.find((c) => c.id === label);
}
