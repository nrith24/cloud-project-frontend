
import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-instructor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './instructor.component.html',
})
export class InstructorComponent {
  private auth = inject(AuthService);

  readonly currentUser = this.auth.currentUser;

  // Temporary instructor course data
  courses = [
    {
      id: 'c1',
      title: 'AWS Cloud Fundamentals',
      category: 'Cloud',
      students: 42,
      progress: 78,
      status: 'Published',
    },
    {
      id: 'c2',
      title: 'Docker & Kubernetes',
      category: 'DevOps',
      students: 35,
      progress: 65,
      status: 'Published',
    },
    {
      id: 'c3',
      title: 'CI/CD with Jenkins',
      category: 'DevOps',
      students: 28,
      progress: 52,
      status: 'Published',
    },
  ];

  readonly totalStudents = computed(() =>
    this.courses.reduce(
      (total, course) =>
        total + course.students,
      0
    )
  );

  readonly totalCourses = computed(
    () => this.courses.length
  );

  readonly averageProgress = computed(() => {
    if (this.courses.length === 0) {
      return 0;
    }

    const total = this.courses.reduce(
      (sum, course) =>
        sum + course.progress,
      0
    );

    return Math.round(
      total / this.courses.length
    );
  });
}

