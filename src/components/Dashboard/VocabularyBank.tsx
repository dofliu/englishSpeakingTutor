import React, { useEffect, useState } from 'react';
import { Book, Volume2 } from 'lucide-react';
import { db, collection, query, orderBy, onSnapshot } from '../../firebase';
import { useAppStore } from '../../store/useAppStore';

export interface VocabularyWord {
  id: string;
  word: string;
  context: string;
  timestamp: string;
}

export const VocabularyBank: React.FC = () => {
  const { user } = useAppStore();
  const [words, setWords] = useState<VocabularyWord[]>([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'vocabulary'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newWords = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VocabularyWord));
      setWords(newWords);
    });

    return unsubscribe;
  }, [user]);

  const pronounceWord = (word: string) => {
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(word);
      msg.lang = 'en-US';
      window.speechSynthesis.speak(msg);
    }
  };

  if (words.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mt-4">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Book className="w-5 h-5 text-indigo-500" />
          My Vocabulary
        </h3>
        <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded-full">{words.length}</span>
      </div>
      
      <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto custom-scrollbar">
        {words.map(w => (
          <div key={w.id} className="p-4 hover:bg-slate-50 transition-colors group">
            <div className="flex items-center justify-between mb-1">
              <span className="font-black text-slate-800 text-lg">{w.word}</span>
              <button 
                onClick={() => pronounceWord(w.word)}
                className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-full transition-all"
                title="Listen to pronunciation"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-slate-500 italic mt-1 bg-slate-100 p-2 rounded-lg border border-slate-200/50">
              "{w.context}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
