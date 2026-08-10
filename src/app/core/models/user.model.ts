export type UserRole = 'student' | 'instructor' | 'admin';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;

  studentId?: string;

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
  role: 'student' | 'instructor';
}

export interface AuthResponse {
  user: User;
  token: string;
}