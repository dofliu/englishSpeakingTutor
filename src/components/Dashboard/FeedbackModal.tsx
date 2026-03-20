import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, AlertTriangle, BookOpen, MessageSquare } from 'lucide-react';
import { FeedbackReport } from '../../services/geminiFeedback';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: FeedbackReport | null;
  topic: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, feedback, topic }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Session Feedback</h2>
              <p className="text-sm text-slate-500">{topic}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1 space-y-8">
            {feedback ? (
              <>
                {/* Score & Overall */}
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="flex-shrink-0 bg-emerald-500 text-white rounded-2xl p-6 text-center min-w-[120px]">
                    <span className="text-4xl font-black">{feedback.score}</span>
                    <span className="block text-xs uppercase tracking-wider font-bold mt-1 opacity-80">Score</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 text-slate-900 font-bold mb-2">
                      <MessageSquare className="w-5 h-5 text-emerald-500" />
                      Tutor's Output
                    </div>
                    <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl">
                      {feedback.overall_comments}
                    </p>
                  </div>
                </div>

                {/* Grammar */}
                {feedback.grammar_issues && feedback.grammar_issues.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      Grammar & Syntax
                    </div>
                    <div className="space-y-3">
                      {feedback.grammar_issues.map((issue, idx) => (
                        <div key={idx} className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                          <div className="flex items-start gap-4 mb-3">
                            <div className="w-1/2">
                              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1 block">You Said</span>
                              <p className="text-slate-700 line-through decoration-red-400">{issue.original}</p>
                            </div>
                            <div className="w-1/2">
                              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1 block">Better Structure</span>
                              <p className="text-emerald-800 font-medium flex items-start gap-1">
                                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {issue.corrected}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-slate-500 bg-white/60 p-3 rounded-lg">
                            <span className="font-bold text-slate-700">Why: </span>{issue.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vocabulary */}
                {feedback.vocabulary_suggestions && feedback.vocabulary_suggestions.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                      <BookOpen className="w-5 h-5 text-indigo-500" />
                      Vocabulary Suggestions
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {feedback.vocabulary_suggestions.map((vocab, idx) => (
                        <div key={idx} className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-slate-500 line-through text-sm">{vocab.basic_word}</span>
                            <span className="text-slate-300">→</span>
                            <span className="font-bold text-indigo-700">{vocab.advanced_word}</span>
                          </div>
                          <p className="text-xs text-indigo-900/70">{vocab.context}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400">No feedback available for this session. (Session might have been too short or feedback generation failed).</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
