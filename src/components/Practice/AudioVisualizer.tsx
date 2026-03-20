import React from 'react';
import { motion } from 'motion/react';
import { Mic, MicOff } from 'lucide-react';

interface AudioVisualizerProps {
  isPracticing: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isPracticing }) => {
  return (
    <div className="p-6 bg-white border-t border-slate-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${isPracticing ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
            {isPracticing ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">
              {isPracticing ? 'Listening...' : 'Microphone Off'}
            </p>
            <p className="text-xs text-slate-500">
              {isPracticing ? 'Speak naturally to interact' : 'Click start to enable voice'}
            </p>
          </div>
        </div>
        
        {isPracticing && (
          <div className="flex gap-1 items-end h-6">
            {[1, 2, 3, 4, 5].map(i => (
              <motion.div
                key={`vis-bar-${i}`}
                animate={{ height: [8, 24, 8] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                className="w-1 bg-emerald-400 rounded-full"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
