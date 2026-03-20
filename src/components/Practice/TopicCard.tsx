import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface TopicCardProps {
  topic: string;
  icon: LucideIcon;
  selected: boolean;
  onSelect: (topic: string) => void;
}

export const TopicCard: React.FC<TopicCardProps> = ({ topic, icon: Icon, selected, onSelect }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => onSelect(topic)}
    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
      selected 
        ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
        : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-emerald-200'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium">{topic}</span>
  </motion.button>
);
