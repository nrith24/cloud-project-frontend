import { Component, computed, inject } from '@angular/core';
import { User } from '../../core/models/user.model';
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
  students: User[] = this.auth.getStudents();

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
    this.courses.reduce((total, course) => total + course.students, 0)
  );

  readonly totalCourses = computed(() => this.courses.length);

  readonly averageProgress = computed(() => {
    if (this.courses.length === 0) {
      return 0;
    }
    const total = this.courses.reduce(
      (sum, course) => sum + course.progress,
      0
    );
    return Math.round(total / this.courses.length);
  });

  openAssignUser(course: any): void {
    const studentList = this.students
      .map((student, index) => `${index + 1}. ${student.fullName}`)
      .join('\n');

    const choice = prompt(
      `Assign "${course.title}"\n\nChoose a student:\n\n${studentList}\n\nEnter the number:`
    );

    if (!choice) {
      return;
    }

    const index = Number(choice) - 1;

    if (index < 0 || index >= this.students.length) {
      alert('Invalid selection.');
      return;
    }

    const student = this.students[index];
    const success = this.auth.assignCourseToStudent(
      student.id,
      course.id
    );

    if (success) {
      alert(`${course.title} assigned to ${student.fullName}`);
    } else {
      alert('Assignment failed.');
    }
  }
}
