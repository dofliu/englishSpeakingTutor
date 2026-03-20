import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, History, Globe, Mic, BookOpen, TrendingUp, Award } from 'lucide-react';
import { useAppStore, SessionRecord } from '../store/useAppStore';
import { db, collection, query, orderBy, limit, onSnapshot } from '../firebase';
import { AccentCard } from '../components/Practice/AccentCard';
import { ScenarioCard } from '../components/Practice/ScenarioCard';
import { FeedbackModal } from '../components/Dashboard/FeedbackModal';
import { ProgressStats } from '../components/Dashboard/ProgressStats';
import { SCENARIOS } from '../constants/scenarios';
import { BADGES } from '../constants/badges';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, selectedAccent, setSelectedAccent, selectedScenarioId, setSelectedScenarioId } = useAppStore();
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionRecord | null>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'sessions'),
      orderBy('timestamp', 'desc'),
      limit(5)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newSessions = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SessionRecord));
      const uniqueSessions = Array.from(new Map(newSessions.map(s => [s.id, s])).values());
      setSessions(uniqueSessions);
    });

    return unsubscribe;
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
      {/* Settings */}
      <div className="lg:col-span-7 space-y-8">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900">
              <Settings className="w-5 h-5" />
              <h2 className="font-bold uppercase tracking-wider text-xs">Session Settings</h2>
            </div>
          </div>
          
          <ProgressStats />
          
          <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-100 flex-1">
            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <Mic className="w-5 h-5 text-emerald-500" />
              Start New Session
            </h2>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-500">Target Accent</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <AccentCard accent="US" label="American" description="Standard American accent." selected={selectedAccent === 'US'} onSelect={setSelectedAccent} />
                  <AccentCard accent="UK" label="British" description="Received Pronunciation (RP)." selected={selectedAccent === 'UK'} onSelect={setSelectedAccent} />
                  <AccentCard accent="AU" label="Australian" description="Standard Australian." selected={selectedAccent === 'AU'} onSelect={setSelectedAccent} />
                  <AccentCard accent="IN" label="Indian" description="Standard Indian English." selected={selectedAccent === 'IN'} onSelect={setSelectedAccent} />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-500">Learning Scenario</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SCENARIOS.map(scenario => (
                    <ScenarioCard 
                      key={scenario.id}
                      scenario={scenario} 
                      selected={selectedScenarioId === scenario.id} 
                      onSelect={setSelectedScenarioId} 
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <button
               onClick={() => navigate('/practice')}
               className="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200 mt-8 text-lg"
            >
               Start Practice
            </button>
          </div>
          
          {/* Achievements */}
          {user && useAppStore.getState().profile?.unlockedBadges && useAppStore.getState().profile!.unlockedBadges!.length > 0 && (
            <div className="bg-white p-6 lg:p-8 rounded-3xl shadow-sm border border-slate-100 mt-6">
              <h2 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                My Achievements
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {BADGES.filter(b => useAppStore.getState().profile?.unlockedBadges?.includes(b.id)).map(badge => {
                  const Icon = badge.icon;
                  return (
                    <div key={badge.id} className="flex flex-col items-center text-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className={`w-12 h-12 rounded-full ${badge.bgColor} ${badge.color} flex items-center justify-center mb-3 shadow-sm`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm">{badge.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-tight">{badge.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Recent History */}
      <div className="lg:col-span-5 space-y-4">
        <div className="flex items-center gap-2 text-slate-900">
          <History className="w-5 h-5" />
          <h2 className="font-bold uppercase tracking-wider text-xs">Recent Sessions</h2>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {sessions.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {sessions.map(s => (
                <div 
                  key={`session-${s.id}`} 
                  onClick={() => s.feedback && setSelectedSession(s)}
                  className={`p-4 flex items-center justify-between transition-colors ${s.feedback ? 'cursor-pointer hover:bg-slate-50' : ''}`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 text-sm">{s.topic}</p>
                      {s.feedback && (
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Score: {s.feedback.score}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{s.accent} Accent • {Math.floor(s.duration / 60)}m {s.duration % 60}s</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {new Date(s.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-slate-400">No sessions yet. Start practicing!</p>
            </div>
          )}
        </div>
      </div>
      
      <FeedbackModal 
        isOpen={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        feedback={selectedSession?.feedback || null}
        topic={selectedSession?.topic || ''}
      />
    </div>
  );
};
