import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  AdminCourse,
  AdminStats,
  AdminUser,
} from '../models/admin.model';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly users: AdminUser[] = [
    {
      id: 'USR001',
      name: 'Arun Kumar',
      email: 'arun@example.com',
      role: 'student',
      enrolledCourses: 5,
      completedCourses: 2,
      progress: 68,
      lastActive: 'Today',
      status: 'Active',
      joinedDate: '10 Aug 2026',
    },
    {
      id: 'USR002',
      name: 'Priya Sharma',
      email: 'priya@example.com',
      role: 'student',
      enrolledCourses: 4,
      completedCourses: 3,
      progress: 82,
      lastActive: 'Today',
      status: 'Active',
      joinedDate: '08 Aug 2026',
    },
    {
      id: 'USR003',
      name: 'Rahul Singh',
      email: 'rahul@example.com',
      role: 'student',
      enrolledCourses: 3,
      completedCourses: 1,
      progress: 45,
      lastActive: 'Yesterday',
      status: 'Active',
      joinedDate: '05 Aug 2026',
    },
    {
      id: 'USR004',
      name: 'Sneha Reddy',
      email: 'sneha@example.com',
      role: 'instructor',
      enrolledCourses: 0,
      completedCourses: 0,
      progress: 0,
      lastActive: 'Today',
      status: 'Active',
      joinedDate: '01 Aug 2026',
    },
    {
      id: 'USR005',
      name: 'Vikram Das',
      email: 'vikram@example.com',
      role: 'student',
      enrolledCourses: 6,
      completedCourses: 4,
      progress: 91,
      lastActive: '2 days ago',
      status: 'Active',
      joinedDate: '28 Jul 2026',
    },
    {
      id: 'USR006',
      name: 'Meena Joseph',
      email: 'meena@example.com',
      role: 'student',
      enrolledCourses: 2,
      completedCourses: 0,
      progress: 24,
      lastActive: '5 days ago',
      status: 'Inactive',
      joinedDate: '20 Jul 2026',
    },
    {
      id: 'USR007',
      name: 'Karthik Raj',
      email: 'karthik@example.com',
      role: 'instructor',
      enrolledCourses: 0,
      completedCourses: 0,
      progress: 0,
      lastActive: 'Today',
      status: 'Active',
      joinedDate: '18 Jul 2026',
    },
    {
      id: 'USR008',
      name: 'Admin User',
      email: 'admin@cloudpath.com',
      role: 'admin',
      enrolledCourses: 0,
      completedCourses: 0,
      progress: 0,
      lastActive: 'Now',
      status: 'Active',
      joinedDate: '01 Jul 2026',
    },
  ];

  private readonly courses: AdminCourse[] = [
    {
      id: 'C001',
      title: 'Docker & Containers',
      instructor: 'Sneha Reddy',
      enrolledStudents: 145,
      completionRate: 72,
      status: 'Published',
    },
    {
      id: 'C002',
      title: 'AWS Cloud Fundamentals',
      instructor: 'Karthik Raj',
      enrolledStudents: 128,
      completionRate: 64,
      status: 'Published',
    },
    {
      id: 'C003',
      title: 'Kubernetes for Beginners',
      instructor: 'Sneha Reddy',
      enrolledStudents: 96,
      completionRate: 58,
      status: 'Published',
    },
    {
      id: 'C004',
      title: 'CI/CD with GitHub Actions',
      instructor: 'Karthik Raj',
      enrolledStudents: 82,
      completionRate: 69,
      status: 'Published',
    },
  ];

  getStats(): Observable<AdminStats> {
    return of({
      totalUsers: 1248,
      totalStudents: 1192,
      totalInstructors: 54,
      totalCourses: 86,
      totalEnrollments: 3428,
      activeStudents: 874,
      averageCompletion: 67,
    });
  }

  getUsers(): Observable<AdminUser[]> {
    return of(this.users);
  }

  getCourses(): Observable<AdminCourse[]> {
    return of(this.courses);
  }
}