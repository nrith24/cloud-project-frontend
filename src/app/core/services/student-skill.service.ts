import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface InitialStudentSkills {
  pythonSkill: number;
  sqlSkill: number;
  mlSkill: number;
  webSkill: number;
}

@Injectable({
  providedIn: 'root',
})
export class StudentSkillService {

  private readonly STORAGE_KEY =
    'cloudpath_student_skills';

  saveInitialSkills(
    studentId: string,
    skills: InitialStudentSkills
  ): Observable<boolean> {

    if (!studentId) {
      return throwError(
        () => new Error('Student ID is required.')
      );
    }

    const existing =
      this.getStoredSkills();

    existing[studentId] = skills;

    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(existing)
    );

    return of(true).pipe(
      delay(500)
    );
  }

  getInitialSkills(
    studentId: string
  ): InitialStudentSkills | null {

    const existing =
      this.getStoredSkills();

    return existing[studentId] ?? null;
  }

  private getStoredSkills(): Record<
    string,
    InitialStudentSkills
  > {

    try {

      const raw =
        localStorage.getItem(
          this.STORAGE_KEY
        );

      if (!raw) {
        return {};
      }

      return JSON.parse(raw);

    } catch {

      return {};

    }
  }
}