export interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'employee' | 'admin';
  office?: string;
  position?: string;
  department?: string;
  phoneNumber?: string;
  isOnboarded: boolean;
  gallupStrengths?: Record<string, any>;
  personalityType?: string;
  interests?: string[];
  availability?: {
    weekdays: boolean;
    weekends: boolean;
    timeSlots: string[];
  };
  totalHours: number;
  currentLevel: string;
  totalPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: number;
  title: string;
  description: string;
  type: 'ong_volunteering' | 'lab' | 'micro_mission' | 'training';
  organizationId?: number;
  sdgGoals?: number[];
  requiredSkills?: string[];
  location?: string;
  isVirtual: boolean;
  maxParticipants?: number;
  duration?: number;
  scheduledDate?: string;
  registrationDeadline?: string;
  pointsReward: number;
  status: 'draft' | 'published' | 'completed' | 'cancelled';
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: number;
  name: string;
  description?: string;
  focusAreas?: string[];
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Participation {
  id: number;
  userId: number;
  activityId: number;
  status: 'registered' | 'confirmed' | 'completed' | 'cancelled';
  appliedAt: string;
  completedAt?: string;
  hoursLogged?: number;
  pointsEarned: number;
  feedback?: string;
  rating?: number;
}

export interface Badge {
  id: number;
  name: string;
  description?: string;
  iconUrl?: string;
  requirements?: Record<string, any>;
  pointsRequired?: number;
  isActive: boolean;
  createdAt: string;
}

export interface Certificate {
  id: number;
  userId: number;
  type: 'poap' | 'pdf';
  title: string;
  description?: string;
  issueDate: string;
  validUntil?: string;
  certificateUrl?: string;
  metadata?: Record<string, any>;
  activityId?: number;
}

export interface TrainingModule {
  id: number;
  title: string;
  description?: string;
  moduleNumber: number;
  prerequisiteModuleId?: number;
  content?: Record<string, any>;
  duration?: number;
  pointsReward: number;
  isActive: boolean;
  createdAt: string;
}

export interface UserStats {
  totalHours: number;
  totalPoints: number;
  badgeCount: number;
  level: string;
  sdgCount: number;
}

export interface AIRecommendation {
  activityId: number;
  score: number;
  reasons: string[];
  activity: Activity;
}
