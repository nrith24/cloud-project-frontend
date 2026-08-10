import { Injectable, signal, computed } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from '../models/user.model';

const STORAGE_KEY = 'cloudpath_auth';
const PENDING_KEY = 'cloudpath_pending_registration';

interface StoredAuth {
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _currentUser = signal<User | null>(this.readStoredUser());

  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this._currentUser() !== null);

  private readStoredUser(): User | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      const parsed: StoredAuth = JSON.parse(raw);
      return parsed.user ?? null;
    } catch {
      return null;
    }
  }

  private persistSession(res: AuthResponse): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(res));
    this._currentUser.set(res.user);
  }

  /**
   * Creates a mock user.
   * Role is included so the frontend is already compatible
   * with the backend API.
   */
  private mockUserFrom(payload: {
    fullName?: string;
    email: string;
    role?: 'student' | 'instructor';
  }): User {
    const fullName = payload.fullName ?? payload.email.split('@')[0];

    return {
      id: 'usr_' + Math.random().toString(36).slice(2, 10),

      fullName,

      email: payload.email,

      // NEW
      role: payload.role ?? 'student',

      studentId: 'CLD-' + Math.floor(100000 + Math.random() * 900000),

      avatarUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(
        fullName
      )}`,

      enrolledCourseIds: ['c1', 'c3', 'c5'],

      completedCourseIds: ['c1'],

      createdAt: new Date().toISOString(),
    };
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    if (!payload.email || !payload.password) {
      return throwError(
        () => new Error('Email and password are required.')
      );
    }

    const res: AuthResponse = {
      user: this.mockUserFrom({
        email: payload.email,
        role: 'student', // default role for mock login
      }),
      token: 'mock-jwt-' + Math.random().toString(36).slice(2),
    };

    return of(res).pipe(
      delay(1100),
      tap((r) => this.persistSession(r))
    );
  }

  register(payload: RegisterPayload): Observable<{ email: string }> {
    // Save pending registration (includes role)
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(payload));

    return of({
      email: payload.email,
    }).pipe(delay(1200));
  }

  verifyOtp(otp: string): Observable<AuthResponse> {
    const pendingRaw = sessionStorage.getItem(PENDING_KEY);

    if (!pendingRaw) {
      return throwError(
        () =>
          new Error(
            'No pending registration found. Please register again.'
          )
      );
    }

    if (otp.length !== 6) {
      return throwError(
        () => new Error('Enter the complete 6-digit code.')
      );
    }

    // Mock failure
    if (otp === '000000') {
      return throwError(
        () => new Error('That code is incorrect. Please try again.')
      );
    }

    const pending: RegisterPayload = JSON.parse(pendingRaw);

    const res: AuthResponse = {
      user: this.mockUserFrom({
        fullName: pending.fullName,
        email: pending.email,
        role: pending.role,
      }),
      token: 'mock-jwt-' + Math.random().toString(36).slice(2),
    };

    return of(res).pipe(
      delay(900),
      tap((r) => {
        this.persistSession(r);
        sessionStorage.removeItem(PENDING_KEY);
      })
    );
  }

  resendOtp(): Observable<{ sent: boolean }> {
    return of({ sent: true }).pipe(delay(700));
  }

  getPendingEmail(): string | null {
    const raw = sessionStorage.getItem(PENDING_KEY);

    if (!raw) {
      return null;
    }

    return (JSON.parse(raw) as RegisterPayload).email;
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this._currentUser.set(null);
  }

  getToken(): string | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return null;
      }

      return (JSON.parse(raw) as StoredAuth).token ?? null;
    } catch {
      return null;
    }
  }
}