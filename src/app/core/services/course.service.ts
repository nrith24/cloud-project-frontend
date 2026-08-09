import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ActivityItem, Course, EnrolledCourse, Testimonial } from '../models/course.model';

/**
 * ---------------------------------------------------------------------
 * BACKEND INTEGRATION POINT
 * Swap each `of(DATA).pipe(delay(...))` call for an HttpClient request,
 * e.g. `this.http.get<Course[]>('/api/courses')`. Method signatures and
 * return shapes are kept API-ready on purpose.
 * ---------------------------------------------------------------------
 */
@Injectable({ providedIn: 'root' })
export class CourseService {
  private readonly courses: Course[] = [
    {
      id: 'c1',
      title: 'AWS Solutions Architect — Associate',
      instructor: 'Priya Raman',
      category: 'AWS',
      thumbnail: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=600&q=80',
      level: 'Intermediate',
      rating: 4.8,
      studentsCount: 18420,
      durationHours: 32,
      price: 49.99,
      description: 'Design resilient, cost-optimized architectures on AWS and get certification-ready.',
    },
    {
      id: 'c2',
      title: 'Microsoft Azure Fundamentals (AZ-900)',
      instructor: 'Daniel Cho',
      category: 'Azure',
      thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=600&q=80',
      level: 'Beginner',
      rating: 4.6,
      studentsCount: 12980,
      durationHours: 18,
      price: 39.99,
      description: 'A friendly introduction to Azure services, pricing, and governance.',
    },
    {
      id: 'c3',
      title: 'Docker & Kubernetes: The Complete Guide',
      instructor: 'Sara Lindqvist',
      category: 'Docker',
      thumbnail: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=600&q=80',
      level: 'Intermediate',
      rating: 4.9,
      studentsCount: 24310,
      durationHours: 27,
      price: 54.99,
      description: 'Containerize applications and orchestrate them in production-grade clusters.',
    },
    {
      id: 'c4',
      title: 'Kubernetes for Developers',
      instructor: 'Marcus Webb',
      category: 'Kubernetes',
      thumbnail: 'https://images.unsplash.com/photo-1667372393119-8a2d7fe1c525?w=600&q=80',
      level: 'Advanced',
      rating: 4.7,
      studentsCount: 9870,
      durationHours: 21,
      price: 59.99,
      description: 'Deploy, scale and debug workloads on Kubernetes like a platform engineer.',
    },
    {
      id: 'c5',
      title: 'Google Cloud Associate Engineer',
      instructor: 'Aiko Tanaka',
      category: 'Google Cloud',
      thumbnail: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600&q=80',
      level: 'Intermediate',
      rating: 4.5,
      studentsCount: 7660,
      durationHours: 24,
      price: 44.99,
      description: 'Deploy, monitor, and manage GCP resources with confidence.',
    },
    {
      id: 'c6',
      title: 'DevOps Bootcamp: CI/CD, IaC & Monitoring',
      instructor: 'Priya Raman',
      category: 'DevOps',
      thumbnail: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=600&q=80',
      level: 'Advanced',
      rating: 4.9,
      studentsCount: 15230,
      durationHours: 38,
      price: 64.99,
      description: 'Build automated pipelines with Terraform, GitHub Actions and Prometheus.',
    },
  ];

  private readonly testimonials: Testimonial[] = [
    {
      id: 't1',
      name: 'Ananya Iyer',
      role: 'Cloud Engineer, Chennai',
      quote:
        'CloudPath took me from zero to AWS-certified in ten weeks. The hands-on labs made every concept stick.',
      avatarUrl: 'https://i.pravatar.cc/100?img=47',
      rating: 5,
    },
    {
      id: 't2',
      name: 'Ben Okafor',
      role: 'DevOps Lead, Austin',
      quote:
        'The Kubernetes track is the most practical course I have taken — real clusters, real incidents to debug.',
      avatarUrl: 'https://i.pravatar.cc/100?img=12',
      rating: 5,
    },
    {
      id: 't3',
      name: 'Mei Lin',
      role: 'Platform Engineer, Singapore',
      quote:
        'Clear explanations, active community, and the certificates actually got me noticed by recruiters.',
      avatarUrl: 'https://i.pravatar.cc/100?img=32',
      rating: 4,
    },
  ];

  private readonly activity: ActivityItem[] = [
    { id: 'a1', type: 'module', title: 'Completed Module 1: Cloud Fundamentals', timestamp: '2 hours ago' },
    { id: 'a2', type: 'video', title: 'Watched "Docker Basics" (18 min)', timestamp: 'Yesterday' },
    { id: 'a3', type: 'quiz', title: 'Passed Kubernetes Quiz — 92%', timestamp: '2 days ago' },
    { id: 'a4', type: 'certificate', title: 'Downloaded AWS Solutions Architect certificate', timestamp: '5 days ago' },
  ];

  getCourses(): Observable<Course[]> {
    return of(this.courses).pipe(delay(500));
  }

  getFeaturedCourses(limit = 3): Observable<Course[]> {
    return of(this.courses.slice(0, limit)).pipe(delay(500));
  }

  getCourseById(id: string): Observable<Course | undefined> {
    return of(this.courses.find((c) => c.id === id)).pipe(delay(300));
  }

  getEnrolledCourses(enrolledIds: string[], completedIds: string[]): Observable<EnrolledCourse[]> {
    const enrolled: EnrolledCourse[] = this.courses
      .filter((c) => enrolledIds.includes(c.id))
      .map((c, i) => ({
        ...c,
        progress: completedIds.includes(c.id) ? 100 : [35, 62, 18][i % 3],
        lastAccessed: ['Today', 'Yesterday', '3 days ago'][i % 3],
      }));
    return of(enrolled).pipe(delay(600));
  }

  getRecommendedCourses(excludeIds: string[]): Observable<Course[]> {
    return of(this.courses.filter((c) => !excludeIds.includes(c.id))).pipe(delay(500));
  }

  getTestimonials(): Observable<Testimonial[]> {
    return of(this.testimonials).pipe(delay(400));
  }

  getRecentActivity(): Observable<ActivityItem[]> {
    return of(this.activity).pipe(delay(400));
  }
}
