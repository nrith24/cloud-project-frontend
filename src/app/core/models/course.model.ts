export interface Course {
  id: string;
  title: string;
  instructor: string;
  category: 'AWS' | 'Azure' | 'Google Cloud' | 'Docker' | 'Kubernetes' | 'DevOps';
  thumbnail: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  studentsCount: number;
  durationHours: number;
  price: number;
  description: string;
  assignedUsers?: string[];
}

export interface EnrolledCourse extends Course {
  progress: number;
  lastAccessed: string;
}

export interface ActivityItem {
  id: string;
  type: 'module' | 'video' | 'quiz' | 'certificate';
  title: string;
  timestamp: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  avatarUrl: string;
  rating: number;
}
