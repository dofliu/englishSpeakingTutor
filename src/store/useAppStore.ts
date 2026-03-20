import { create } from 'zustand';
import { User } from '../firebase';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  preferredAccent?: string;
  totalSessions?: number;
  totalSpeakingSeconds?: number;
  streakDays?: number;
  lastPracticeDate?: string;
  totalScore?: number;
  unlockedBadges?: string[];
  lastActive?: string;
}

import { FeedbackReport } from '../services/geminiFeedback';

export interface SessionRecord {
  id: string;
  accent: string;
  topic: string;
  timestamp: string;
  duration: number;
  feedback?: FeedbackReport;
}

interface TranscriptItem {
  id: string;
  text: string;
  isUser?: boolean;
}

interface AppState {
  // Auth & User State
  user: User | null;
  profile: UserProfile | null;
  isAuthReady: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setIsAuthReady: (ready: boolean) => void;

  // Session Settings
  selectedAccent: string;
  selectedScenarioId: string;
  setSelectedAccent: (accent: string) => void;
  setSelectedScenarioId: (id: string) => void;

  // Practice State
  isPracticing: boolean;
  transcript: TranscriptItem[];
  sessionStartTime: number | null;
  setIsPracticing: (isPracticing: boolean) => void;
  addTranscriptItem: (item: Omit<TranscriptItem, 'id'>) => void;
  clearTranscript: () => void;
  setSessionStartTime: (time: number | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  profile: null,
  isAuthReady: false,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setIsAuthReady: (isAuthReady) => set({ isAuthReady }),

  selectedAccent: 'US',
  selectedScenarioId: 'daily_chat',
  setSelectedAccent: (selectedAccent) => set({ selectedAccent }),
  setSelectedScenarioId: (selectedScenarioId) => set({ selectedScenarioId }),

  isPracticing: false,
  transcript: [],
  sessionStartTime: null,
  setIsPracticing: (isPracticing) => set({ isPracticing }),
  addTranscriptItem: (item) => set((state) => ({ 
    transcript: [...state.transcript, { ...item, id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}` }] 
  })),
  clearTranscript: () => set({ transcript: [] }),
  setSessionStartTime: (sessionStartTime) => set({ sessionStartTime }),
}));
