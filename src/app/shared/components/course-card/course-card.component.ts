import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Course, EnrolledCourse } from '../../../core/models/course.model';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './course-card.component.html',
})
export class CourseCardComponent {
  @Input({ required: true }) course!: Course | EnrolledCourse;
  @Input() showProgress = false;

  get enrolled(): EnrolledCourse | null {
    return this.showProgress ? (this.course as EnrolledCourse) : null;
  }

  readonly categoryColors: Record<string, string> = {
    AWS: 'bg-orange-50 text-orange-600',
    Azure: 'bg-sky-50 text-sky-600',
    'Google Cloud': 'bg-blue-50 text-blue-600',
    Docker: 'bg-cyan-50 text-cyan-600',
    Kubernetes: 'bg-indigo-50 text-indigo-600',
    DevOps: 'bg-teal-50 text-teal-600',
  };
}
