import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Globe, TrendingUp, Mic, LucideIcon } from 'lucide-react';
import { Scenario } from '../../constants/scenarios';

const getIconForScenario = (id: string): LucideIcon => {
  if (id.includes('daily')) return BookOpen;
  if (id.includes('travel') || id.includes('hotel')) return Globe;
  if (id.includes('business') || id.includes('meeting')) return TrendingUp;
  return Mic;
};

interface ScenarioCardProps {
  scenario: Scenario;
  selected: boolean;
  onSelect: (scenarioId: string) => void;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario, selected, onSelect }) => {
  const Icon = getIconForScenario(scenario.id);

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(scenario.id)}
      className={`flex flex-col items-start text-left p-4 rounded-xl border-2 transition-all ${
        selected 
          ? 'border-emerald-500 bg-emerald-50' 
          : 'border-slate-100 bg-slate-50 hover:border-emerald-200'
      }`}
    >
      <div className="flex items-center gap-2 mb-2 w-full">
        <div className={`p-2 rounded-lg ${selected ? 'bg-emerald-100/50 text-emerald-700' : 'bg-slate-200/50 text-slate-600'}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <span className={`font-bold ${selected ? 'text-emerald-900' : 'text-slate-800'}`}>{scenario.title}</span>
        </div>
        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${selected ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-500'}`}>
          {scenario.level}
        </span>
      </div>
      <p className={`text-xs ${selected ? 'text-emerald-700/80' : 'text-slate-500'} line-clamp-2`}>
        {scenario.description}
      </p>
    </motion.button>
  );
};
