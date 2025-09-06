export interface User {
  id: string;
  name: string;
  email: string;
  batch: string;
  role: string;
  skills: string[];
  bio: string;
  avatar: string;
  company?: string;
  location?: string;
  linkedin?: string;
  joinDate: string;
  token?: string;
  preferences?: {
    privacy?: 'public' | 'alumni-only' | 'private';
    notifications?: {
      email: boolean;
      push: boolean;
      mentorship: boolean;
      events: boolean;
      chat: boolean;
    };
  };
  mentorshipProfile?: {
    isAvailable?: boolean;
    expertise: string[];
    experience: string;
    maxMentees?: number;
    preferredMeetingType?: 'virtual' | 'in-person' | 'both';
    hourlyRate?: number;
    bio?: string;
  };
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  attendees: string[];
  comments: Comment[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
}

export interface MentorshipRequest {
  id: string;
  mentee: User;
  mentor: User;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  message: string;
  goals: string[];
  preferredMeetingType: 'virtual' | 'in-person' | 'both';
  expectedDuration: string;
  createdAt: string;
  updatedAt: string;
  meetings?: {
    id: string;
    scheduledAt: string;
    duration: number;
    meetingLink?: string;
    notes?: string;
    status: 'scheduled' | 'completed' | 'cancelled';
  }[];
  feedback?: {
    rating: number;
    comment: string;
    createdAt: string;
  };
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: Partial<User> & { password: string }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => void;
}