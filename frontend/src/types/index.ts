export type Role = "user" | "mentor" | "admin";

export interface User {
  _id: string;
  email: string;
  anonymousUsername: string;
  role: Role;
  mentalHealthScore: number;
  streakDays: number;
  isFlaggedUrgent: boolean;
  assignedMentor?: string | null;
  mentorProfile?: { bio: string; specialties: string[] };
}

export interface Post {
  _id: string;
  author: { _id: string; anonymousUsername: string };
  content: string;
  category: string;
  tags: string[];
  imageUrl?: string | null;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export interface AIAnalysis {
  emotion: string;
  confidence: number;
  moodScore: number;
  riskLevel: "none" | "low" | "medium" | "high" | "critical";
  indicators: string[];
  recommendations: string[];
}

export interface MoodLog {
  date: string;
  mood: number;
  stressLevel: number;
  sleepHours?: number;
}
