import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { CourseService } from '../../core/services/course.service';
import { ActivityItem, Course, EnrolledCourse } from '../../core/models/course.model';
import { CourseCardComponent } from '../../shared/components/course-card/course-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CourseCardComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  // 1. Inject dependencies directly into class properties
  private auth = inject(AuthService);
  private courseService = inject(CourseService);

  // 2. This can now safely reference 'this.auth' during initialization
  readonly user = this.auth.currentUser;

  readonly enrolledCourses = signal<EnrolledCourse[]>([]);
  readonly loadingEnrolled = signal(true);
  readonly recommended = signal<Course[]>([]);
  readonly loadingRecommended = signal(true);
  readonly activity = signal<ActivityItem[]>([]);
  readonly loadingActivity = signal(true);
  readonly skeletonArray = Array.from({ length: 3 });

  readonly completionPercent = computed(() => {
    const u = this.user();
    if (!u || u.enrolledCourseIds.length === 0) return 0;
    return Math.round((u.completedCourseIds.length / u.enrolledCourseIds.length) * 100);
  });

  readonly activityIcon: Record<ActivityItem['type'], string> = {
    module: 'M9 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4M9 5V3a2 2 0 0 1 2-2h9v9h-9a2 2 0 0 1-2-2V5Z',
    video: 'M4 6h16v12H4zM10 9l5 3-5 3V9Z',
    quiz: 'M9 11l3 3 6-6M5 5h14v14H5z',
    certificate: 'M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8ZM6.5 14l-1.8 6.5L9 19l2 2 1.9-6M17.5 14l1.8 6.5L15 19l-2 2-1.9-6',
  };

  // 3. Clear constructor parameters
  constructor() {}

  ngOnInit(): void {
    const u = this.user();
    if (!u) return;

    this.courseService.getEnrolledCourses(u.enrolledCourseIds, u.completedCourseIds).subscribe((courses) => {
      this.enrolledCourses.set(courses);
      this.loadingEnrolled.set(false);
    });

    this.courseService.getRecommendedCourses(u.enrolledCourseIds).subscribe((courses) => {
      this.recommended.set(courses);
      this.loadingRecommended.set(false);
    });

    this.courseService.getRecentActivity().subscribe((items) => {
      this.activity.set(items);
      this.loadingActivity.set(false);
    });
  }
}
