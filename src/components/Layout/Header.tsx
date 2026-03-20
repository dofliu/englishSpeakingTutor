import React from 'react';
import { Globe, LogOut } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { auth, signOut } from '../../firebase';

export const Header: React.FC = () => {
  const { user, profile } = useAppStore();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10 w-full">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-lg">AccentMaster</span>
        </div>
        
        {user && (
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold text-slate-900">{profile?.displayName || user.displayName}</span>
              <span className="text-xs text-slate-500">{profile?.totalSessions || 0} Sessions</span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
