import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Square, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { GeminiLiveService } from '../services/geminiLive';
import { generateSessionFeedback } from '../services/geminiFeedback';
import { db, doc, setDoc, addDoc, collection } from '../firebase';
import { TranscriptViewer } from '../components/Practice/TranscriptViewer';
import { AudioVisualizer } from '../components/Practice/AudioVisualizer';
import { SCENARIOS } from '../constants/scenarios';
import { BADGES } from '../constants/badges';

export const Practice: React.FC = () => {
  const navigate = useNavigate();
  const { 
    user, profile, selectedAccent, selectedScenarioId, 
    isPracticing, setIsPracticing, sessionStartTime, setSessionStartTime,
    clearTranscript, addTranscriptItem 
  } = useAppStore();
  const [isEvaluating, setIsEvaluating] = React.useState(false);
  
  const scenario = SCENARIOS.find(s => s.id === selectedScenarioId) || SCENARIOS[0];
  
  const liveService = useRef<GeminiLiveService | null>(null);
  const recognitionRef = useRef<any>(null);
  const transcriptCounter = useRef(0);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (liveService.current && isPracticing) {
        liveService.current.disconnect();
        setIsPracticing(false);
      }
    };
  }, [isPracticing, setIsPracticing]);

  // Provide initial message array mapping support from API callbacks
  const startPractice = async () => {
    if (!liveService.current) {
      liveService.current = new GeminiLiveService();
    }
    
    clearTranscript();
    setIsPracticing(true);
    setSessionStartTime(Date.now());
    
    // Setup Speech Recognition for User Transcripts
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      if (!recognitionRef.current) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onresult = (event: any) => {
          const result = event.results[event.results.length - 1];
          if (result.isFinal) {
            const text = result[0].transcript.trim();
            if (text) {
              addTranscriptItem({ text, isUser: true });
            }
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
        };
        
        recognitionRef.current.onend = () => {
          // Auto-restart if still practicing
          if (useAppStore.getState().isPracticing && recognitionRef.current) {
            try { recognitionRef.current.start(); } catch (e) {}
          }
        };
      }
      try { recognitionRef.current.start(); } catch (e) {
        console.warn("Failed to start speech recognition", e);
      }
    }

    try {
      await liveService.current.connect(
        { accent: selectedAccent, scenario },
        (text) => addTranscriptItem({ text, isUser: false }),
        () => console.log("Interrupted")
      );
    } catch (error) {
      console.error("Failed to start practice:", error);
      setIsPracticing(false);
    }
  };

  const stopPractice = async () => {
    if (liveService.current) {
      liveService.current.disconnect();
    }
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      try { recognitionRef.current.stop(); } catch(e) {}
    }
    setIsPracticing(false);
    
    if (user && sessionStartTime) {
      setIsEvaluating(true);
      const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
      
      const transcriptData = useAppStore.getState().transcript;
      const feedback = await generateSessionFeedback(transcriptData, selectedAccent, scenario);
      
      // Calculate streak
      const today = new Date().toLocaleDateString();
      const lastDate = profile?.lastPracticeDate;
      
      let newStreak = profile?.streakDays || 0;
      if (lastDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastDate === yesterday.toLocaleDateString()) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
      }

      await addDoc(collection(db, 'users', user.uid, 'sessions'), {
        userId: user.uid,
        accent: selectedAccent,
        topic: scenario.title,
        duration,
        timestamp: new Date().toISOString(),
        ...(feedback && { feedback })
      });
      
      const newTotalSessions = (profile?.totalSessions || 0) + 1;
      const newTotalSpeakingSeconds = (profile?.totalSpeakingSeconds || 0) + duration;
      const newTotalScore = (profile?.totalScore || 0) + (feedback?.score || 0);
      const newAverageScore = newTotalSessions > 0 ? Math.round(newTotalScore / newTotalSessions) : 0;
      
      const stats = {
        totalSessions: newTotalSessions,
        streakDays: newStreak,
        totalSpeakingSeconds: newTotalSpeakingSeconds,
        averageScore: newAverageScore,
      };

      const currentBadges = profile?.unlockedBadges || [];
      const newUnlockedBadges = BADGES.filter(b => b.condition(stats) && !currentBadges.includes(b.id)).map(b => b.id);
      const updatedBadges = [...currentBadges, ...newUnlockedBadges];

      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, { 
        totalSessions: newTotalSessions,
        totalSpeakingSeconds: newTotalSpeakingSeconds,
        streakDays: newStreak,
        lastPracticeDate: today,
        totalScore: newTotalScore,
        unlockedBadges: updatedBadges,
        lastActive: new Date().toISOString()
      }, { merge: true });
      
      setIsEvaluating(false);
      navigate('/dashboard');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 w-full flex flex-col h-[calc(100vh-4rem)]">
      <div className="mb-4">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden">
        {/* Practice Header */}
        <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between bg-slate-50/50 gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${isPracticing ? 'bg-red-500 animate-pulse' : 'bg-slate-300'}`} />
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Live Practice Session</h3>
              <p className="text-sm text-slate-500">{selectedAccent} Accent • {scenario.title}</p>
            </div>
          </div>
          
          {!isPracticing ? (
            <button
              onClick={startPractice}
              className="flex items-center gap-2 py-2 px-6 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200"
            >
              <Play className="w-4 h-4 fill-current" />
              Start Session
            </button>
          ) : (
            <button
              onClick={stopPractice}
              disabled={isEvaluating}
              className={`flex items-center gap-2 py-2 px-6 rounded-xl font-bold transition-colors shadow-lg ${
                isEvaluating 
                  ? 'bg-red-400 text-white cursor-not-allowed shadow-red-200/50' 
                  : 'bg-red-500 text-white hover:bg-red-600 shadow-red-200'
              }`}
            >
              <Square className="w-4 h-4 fill-current" />
              {isEvaluating ? 'Evaluating...' : 'Stop Session'}
            </button>
          )}
        </div>

        <TranscriptViewer scrollRef={transcriptEndRef} />
        <AudioVisualizer isPracticing={isPracticing} />
      </div>
      
      {/* Tips */}
      <div className="mt-4 flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-bold mb-1">Learning Tip</p>
          <p>Try to mimic the rhythm and intonation of the AI tutor. Focus on how they pronounce specific vowel sounds unique to the {selectedAccent} accent.</p>
        </div>
      </div>
    </div>
  );
};
