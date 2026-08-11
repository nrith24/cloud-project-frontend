import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { StudentSkillService } from '../../core/services/student-skill.service';

type SkillKey =
  | 'python'
  | 'sql'
  | 'machineLearning'
  | 'webDevelopment';

type SkillLevel =
  | 'beginner'
  | 'intermediate'
  | 'advanced';

interface SkillOption {
  key: SkillKey;
  name: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-skill-setup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './skill-setup.component.html',
})
export class SkillSetupComponent {

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly skillService = inject(StudentSkillService);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly skills: SkillOption[] = [
    {
      key: 'python',
      name: 'Python',
      description:
        'Programming, automation and backend development',
      icon: '🐍',
    },
    {
      key: 'sql',
      name: 'SQL',
      description:
        'Databases, queries and data management',
      icon: '🗄️',
    },
    {
      key: 'machineLearning',
      name: 'Machine Learning',
      description:
        'ML algorithms, models and data-driven systems',
      icon: '🤖',
    },
    {
      key: 'webDevelopment',
      name: 'Web Development',
      description:
        'Frontend, backend and web applications',
      icon: '🌐',
    },
  ];

  readonly skillForm = this.fb.nonNullable.group({
    python: [''],
    sql: [''],
    machineLearning: [''],
    webDevelopment: [''],
  });

  get selectedCount(): number {
    return this.selectedSkills().length;
  }

  selectedSkills(): SkillKey[] {
    const values = this.skillForm.getRawValue();

    return (Object.keys(values) as SkillKey[])
      .filter((key) => values[key] !== '');
  }

  isSelected(skill: SkillKey): boolean {
    return this.skillForm.controls[skill].value !== '';
  }

  toggleSkill(skill: SkillKey): void {
    const control = this.skillForm.controls[skill];

    if (control.value) {
      control.setValue('');
    } else {
      control.setValue('beginner');
    }

    this.errorMessage.set(null);
  }

  selectLevel(
    skill: SkillKey,
    level: SkillLevel
  ): void {
    this.skillForm.controls[skill].setValue(level);

    this.errorMessage.set(null);
  }

  submit(): void {
    this.errorMessage.set(null);

    const selected = this.selectedSkills();

    if (selected.length === 0) {
      this.errorMessage.set(
        'Please select at least one skill.'
      );
      return;
    }

    const values = this.skillForm.getRawValue();

    const payload = {
      pythonSkill: this.convertLevel(values.python),
      sqlSkill: this.convertLevel(values.sql),
      mlSkill: this.convertLevel(values.machineLearning),
      webSkill: this.convertLevel(
        values.webDevelopment
      ),
    };

    const user = this.auth.currentUser();

    if (!user || user.role !== 'student') {
      this.errorMessage.set(
        'Only students can complete the skill setup.'
      );
      return;
    }

    this.loading.set(true);

    this.skillService
      .saveInitialSkills(user.id, payload)
      .subscribe({
        next: () => {
          this.loading.set(false);

          this.auth.clearInitialSkillSetup();

          this.auth.logout();

          this.router.navigate(['/login']);
        },

        error: () => {
          this.loading.set(false);

          this.errorMessage.set(
            'Unable to save your skills. Please try again.'
          );
        },
      });
  }

  private convertLevel(
    level: string
  ): number {

    switch (level) {
      case 'beginner':
        return 1;

      case 'intermediate':
        return 2;

      case 'advanced':
        return 3;

      default:
        return 0;
    }
  }
}