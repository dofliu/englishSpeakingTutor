import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { db, collection, addDoc } from '../../firebase';
import { Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const TranscriptViewer: React.FC<{ scrollRef: React.RefObject<HTMLDivElement> }> = ({ scrollRef }) => {
  const { transcript, user } = useAppStore();
  const [savedWord, setSavedWord] = useState<string | null>(null);

  const handleWordClick = async (wordRaw: string, context: string) => {
    if (!user) return;
    
    // Clean punctuation from word
    const word = wordRaw.replace(/[.,!?()[\]{}"':;]/g, '').trim().toLowerCase();
    if (!word || word.length < 2) return;

    try {
      await addDoc(collection(db, 'users', user.uid, 'vocabulary'), {
        word,
        context,
        timestamp: new Date().toISOString(),
        reviewedCounter: 0
      });
      
      setSavedWord(word);
      setTimeout(() => setSavedWord(null), 2000);
    } catch (error) {
      console.error("Failed to save word:", error);
    }
  };

  const renderTextWithClickableWords = (text: string, isUser: boolean) => {
    return text.split(/(?=\s)|(?<=\s)/).map((segment, index) => {
      if (!segment.trim()) {
        return <span key={index}>{segment}</span>;
      }
      return (
        <span
          key={index}
          onClick={() => handleWordClick(segment, text)}
          className={`cursor-pointer transition-colors duration-200 ${
            isUser ? 'hover:text-emerald-200' : 'hover:text-emerald-500 hover:bg-emerald-50 rounded px-0.5'
          }`}
          title="Click to save to Vocabulary Bank"
        >
          {segment}
        </span>
      );
    });
  };

  return (
    <div className="flex-1 overflow-y-auto mb-6 space-y-4 pr-4 custom-scrollbar relative">
      <AnimatePresence>
        {savedWord && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 text-sm z-50 font-bold"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            Added "{savedWord}" to Vocabulary
          </motion.div>
        )}
      </AnimatePresence>

      {transcript.map((item) => (
        <div key={item.id} className={`flex ${item.isUser ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[80%] p-4 rounded-2xl ${
            item.isUser 
              ? 'bg-emerald-500 text-white rounded-br-sm' 
              : 'bg-white border border-slate-100 shadow-sm text-slate-800 rounded-bl-sm'
          }`}>
            <p className="leading-relaxed whitespace-pre-wrap">
              {renderTextWithClickableWords(item.text, item.isUser)}
            </p>
          </div>
        </div>
      ))}
      <div ref={scrollRef} />
    </div>
  );
};
