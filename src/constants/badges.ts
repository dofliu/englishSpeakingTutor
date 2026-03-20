import { Award, Zap, Flame, Clock, Star, Volume2 } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  condition: (stats: { totalSessions: number; streakDays: number; totalSpeakingSeconds: number; averageScore: number }) => boolean;
}

export const BADGES: Badge[] = [
  {
    id: 'first_step',
    name: 'First Step',
    description: 'Complete your first practice session.',
    icon: Award,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    condition: (stats) => stats.totalSessions >= 1,
  },
  {
    id: 'streak_3',
    name: '3-Day Streak',
    description: 'Practice for 3 consecutive days.',
    icon: Flame,
    color: 'text-orange-500',
    bgColor: 'bg-orange-100',
    condition: (stats) => stats.streakDays >= 3,
  },
  {
    id: 'chatterbox',
    name: 'Chatterbox',
    description: 'Speak for a total of 30 minutes.',
    icon: Volume2,
    color: 'text-purple-500',
    bgColor: 'bg-purple-100',
    condition: (stats) => stats.totalSpeakingSeconds >= 1800,
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Complete 10 practice sessions.',
    icon: Zap,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100',
    condition: (stats) => stats.totalSessions >= 10,
  },
  {
    id: 'high_achiever',
    name: 'High Achiever',
    description: 'Maintain an average score of 85 or higher.',
    icon: Star,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-100',
    condition: (stats) => stats.totalSessions >= 3 && stats.averageScore >= 85,
  },
  {
    id: 'time_master',
    name: 'Time Master',
    description: 'Speak for a total of 1 hour.',
    icon: Clock,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-100',
    condition: (stats) => stats.totalSpeakingSeconds >= 3600,
  }
];
