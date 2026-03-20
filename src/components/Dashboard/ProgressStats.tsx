import React from 'react';
import { Flame, Clock, Target } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const ProgressStats: React.FC = () => {
  const { profile } = useAppStore();

  const streakDays = profile?.streakDays || 0;
  const totalMinutes = Math.floor((profile?.totalSpeakingSeconds || 0) / 60);
  const totalSessions = profile?.totalSessions || 0;
  const averageScore = totalSessions > 0 ? Math.round((profile?.totalScore || 0) / totalSessions) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {/* Streak Card */}
      <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${streakDays > 0 ? 'bg-orange-100 text-orange-500' : 'bg-slate-100 text-slate-400'}`}>
          <Flame className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Day Streak</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-slate-900">{streakDays}</span>
            <span className="text-sm text-slate-400 font-medium">days</span>
          </div>
        </div>
      </div>

      {/* Speaking Time Card */}
      <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-500 flex items-center justify-center">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Speaking</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-slate-900">{totalMinutes}</span>
            <span className="text-sm text-slate-400 font-medium">mins</span>
          </div>
        </div>
      </div>

      {/* Average Score Card */}
      <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-500 flex items-center justify-center">
          <Target className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Average Score</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-slate-900">{averageScore || '-'}</span>
            <span className="text-sm text-slate-400 font-medium">/ 100</span>
          </div>
        </div>
      </div>
    </div>
  );
};
