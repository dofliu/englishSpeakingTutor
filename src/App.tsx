import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Settings, 
  History, 
  LogOut, 
  Globe, 
  BookOpen, 
  TrendingUp,
  Play,
  Square,
  Volume2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit
} from './firebase';
import { GeminiLiveService } from './services/geminiLive';

// --- Types ---
interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  preferredAccent?: string;
  totalSessions?: number;
  lastActive?: string;
}

interface SessionRecord {
  id: string;
  accent: string;
  topic: string;
  timestamp: string;
  duration: number;
}

// --- Components ---

const AccentCard = ({ accent, label, description, selected, onSelect }: any) => (
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

const TopicCard = ({ topic, icon: Icon, selected, onSelect }: any) => (
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

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  const [selectedAccent, setSelectedAccent] = useState('US');
  const [selectedTopic, setSelectedTopic] = useState('Daily Conversation');
  const [isPracticing, setIsPracticing] = useState(false);
  const [transcript, setTranscript] = useState<{ id: string, text: string }[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  
  const transcriptCounter = useRef(0);
  
  const liveService = useRef<GeminiLiveService | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // --- Auth ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const docRef = doc(db, 'users', u.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          const newProfile = {
            uid: u.uid,
            displayName: u.displayName || 'Learner',
            email: u.email || '',
            totalSessions: 0,
            lastActive: new Date().toISOString()
          };
          await setDoc(docRef, newProfile);
          setProfile(newProfile);
        }
      }
      setIsAuthReady(true);
    });
    return unsubscribe;
  }, []);

  // --- Sessions Listener ---
  useEffect(() => {
    if (!user) {
      setSessions([]);
      return;
    }

    const q = query(
      collection(db, 'users', user.uid, 'sessions'),
      orderBy('timestamp', 'desc'),
      limit(5)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newSessions = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SessionRecord));
      // Filter out any potential duplicates by ID just in case
      const uniqueSessions = Array.from(new Map(newSessions.map(s => [s.id, s])).values());
      setSessions(uniqueSessions);
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript]);

  // --- Actions ---
  const handleLogin = () => signInWithPopup(auth, googleProvider);
  const handleLogout = () => signOut(auth);

  const startPractice = async () => {
    if (!liveService.current) {
      liveService.current = new GeminiLiveService();
    }
    
    setTranscript([]);
    setIsPracticing(true);
    setSessionStartTime(Date.now());
    
    try {
      await liveService.current.connect(
        { accent: selectedAccent, topic: selectedTopic },
        (text) => setTranscript(prev => [...prev, { id: `msg-${Date.now()}-${transcriptCounter.current++}-${Math.random().toString(36).substr(2, 4)}`, text }]),
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
    setIsPracticing(false);
    
    if (user && sessionStartTime) {
      const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
      await addDoc(collection(db, 'users', user.uid, 'sessions'), {
        userId: user.uid,
        accent: selectedAccent,
        topic: selectedTopic,
        duration,
        timestamp: new Date().toISOString()
      });
      
      // Update profile
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, { 
        totalSessions: (profile?.totalSessions || 0) + 1,
        lastActive: new Date().toISOString()
      }, { merge: true });
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="space-y-2">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6"
            >
              <Globe className="w-10 h-10 text-emerald-600" />
            </motion.div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">AccentMaster AI</h1>
            <p className="text-slate-500 text-lg">Master English listening and speaking with global accents.</p>
          </div>
          
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
            onClick={handleLogin}
            className="w-full py-4 px-6 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-slate-200 transition-all hover:bg-slate-800"
          >
            <img src="https://www.gstatic.com/firebase/static/bin/urls/google.svg" className="w-6 h-6" alt="Google" />
            Continue with Google
          </motion.button>
          
          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Powered by Gemini 2.5 Live API</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">AccentMaster</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold text-slate-900">{user.displayName}</span>
              <span className="text-xs text-slate-500">{profile?.totalSessions || 0} Sessions</span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Controls */}
        <div className="lg:col-span-4 space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900">
              <Settings className="w-5 h-5" />
              <h2 className="font-bold uppercase tracking-wider text-xs">Session Settings</h2>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-500">Target Accent</label>
                <div className="grid grid-cols-1 gap-3">
                  <AccentCard 
                    accent="US" 
                    label="American" 
                    description="Standard American accent (General American)."
                    selected={selectedAccent === 'US'}
                    onSelect={setSelectedAccent}
                  />
                  <AccentCard 
                    accent="UK" 
                    label="British" 
                    description="Received Pronunciation (RP) or standard British."
                    selected={selectedAccent === 'UK'}
                    onSelect={setSelectedAccent}
                  />
                  <AccentCard 
                    accent="AU" 
                    label="Australian" 
                    description="Standard Australian English accent."
                    selected={selectedAccent === 'AU'}
                    onSelect={setSelectedAccent}
                  />
                  <AccentCard 
                    accent="IN" 
                    label="Indian" 
                    description="Standard Indian English accent."
                    selected={selectedAccent === 'IN'}
                    onSelect={setSelectedAccent}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-500">Conversation Topic</label>
                <div className="grid grid-cols-2 gap-2">
                  <TopicCard topic="Daily Conversation" icon={BookOpen} selected={selectedTopic === 'Daily Conversation'} onSelect={setSelectedTopic} />
                  <TopicCard topic="Business Meeting" icon={TrendingUp} selected={selectedTopic === 'Business Meeting'} onSelect={setSelectedTopic} />
                  <TopicCard topic="Travel & Tourism" icon={Globe} selected={selectedTopic === 'Travel & Tourism'} onSelect={setSelectedTopic} />
                  <TopicCard topic="Job Interview" icon={Mic} selected={selectedTopic === 'Job Interview'} onSelect={setSelectedTopic} />
                </div>
              </div>
            </div>
          </section>

          {/* Recent Activity */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900">
              <History className="w-5 h-5" />
              <h2 className="font-bold uppercase tracking-wider text-xs">Recent Sessions</h2>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {sessions.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {sessions.map(s => (
                    <div key={`session-${s.id}`} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{s.topic}</p>
                        <p className="text-xs text-slate-500">{s.accent} Accent • {Math.floor(s.duration / 60)}m {s.duration % 60}s</p>
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
          </section>
        </div>

        {/* Right Column: Practice Area */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-12rem)] overflow-hidden">
            {/* Practice Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${isPracticing ? 'bg-red-500 animate-pulse' : 'bg-slate-300'}`} />
                <div>
                  <h3 className="font-bold text-slate-900">Live Practice Session</h3>
                  <p className="text-xs text-slate-500">{selectedAccent} Accent • {selectedTopic}</p>
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
                  className="flex items-center gap-2 py-2 px-6 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
                >
                  <Square className="w-4 h-4 fill-current" />
                  Stop Session
                </button>
              )}
            </div>

            {/* Transcript Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
              <AnimatePresence initial={false}>
                {transcript.length === 0 && !isPracticing && (
                  <motion.div 
                    key="empty-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center space-y-4 max-w-sm mx-auto"
                  >
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                      <Volume2 className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Ready to speak?</h4>
                      <p className="text-sm text-slate-500">Choose your settings and click start to begin a real-time conversation with our AI tutor.</p>
                    </div>
                  </motion.div>
                )}
                
                {transcript.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex-shrink-0 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm max-w-[85%]">
                      <p className="text-slate-800 leading-relaxed">{item.text}</p>
                    </div>
                  </motion.div>
                ))}
                <div ref={transcriptEndRef} />
              </AnimatePresence>
            </div>

            {/* Visualizer / Status */}
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
          </div>
          
          {/* Tips */}
          <div className="mt-6 flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-bold mb-1">Learning Tip</p>
              <p>Try to mimic the rhythm and intonation of the AI tutor. Focus on how they pronounce specific vowel sounds unique to the {selectedAccent} accent.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
