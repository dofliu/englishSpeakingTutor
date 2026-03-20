import React from 'react';
import { motion } from 'motion/react';
import { Globe } from 'lucide-react';
import { signInWithPopup, auth, googleProvider } from '../firebase';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (error) {
      console.error("Login Error", error);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 w-full">
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
};
