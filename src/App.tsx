import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { onAuthStateChanged, auth, doc, getDoc, setDoc, db } from './firebase';
import { useAppStore } from './store/useAppStore';

import { Header } from './components/Layout/Header';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Practice } from './pages/Practice';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthReady } = useAppStore();
  
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
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default function App() {
  const { setUser, setProfile, setIsAuthReady } = useAppStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const docRef = doc(db, 'users', u.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as any);
        } else {
          const newProfile = {
            uid: u.uid,
            displayName: u.displayName || 'Learner',
            email: u.email || '',
            totalSessions: 0,
            totalSpeakingSeconds: 0,
            streakDays: 0,
            lastPracticeDate: '',
            totalScore: 0,
            lastActive: new Date().toISOString()
          };
          await setDoc(docRef, newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setIsAuthReady(true);
    });
    return unsubscribe;
  }, [setUser, setProfile, setIsAuthReady]);

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/practice" 
              element={
                <ProtectedRoute>
                  <Practice />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
