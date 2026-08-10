export interface User {
  id: string;
  fullName: string;
  email: string;

  // NEW
  role: 'student' | 'instructor';

  studentId: string;
  avatarUrl?: string;
  enrolledCourseIds: string[];
  completedCourseIds: string[];
  createdAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;

  // NEW
  role: 'student' | 'instructor';
}

export interface AuthResponse {
  user: User;
  token: string;
}