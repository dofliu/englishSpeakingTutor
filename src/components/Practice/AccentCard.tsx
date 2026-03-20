import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

interface AccentCardProps {
  accent: string;
  label: string;
  description: string;
  selected: boolean;
  onSelect: (accent: string) => void;
}

export const AccentCard: React.FC<AccentCardProps> = ({ accent, label, description, selected, onSelect }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => onSelect(accent)}
    className={`p-6 rounded-2xl border-2 text-left transition-all ${
      selected 
        ? 'border-emerald-500 bg-emerald-50/50 ring-4 ring-emerald-500/10' 
        : 'border-slate-200 bg-white hover:border-emerald-200'
    }`}
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-2xl font-bold text-slate-800">{label}</span>
      {selected && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
    </div>
    <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
  </motion.button>
);
