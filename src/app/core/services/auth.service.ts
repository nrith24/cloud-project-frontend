
import { Injectable, signal, computed } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

import {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from '../models/user.model';

import { MOCK_USERS } from '../data/mock-db';

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
  private readonly _currentUser = signal<User | null>(
    this.readStoredUser()
  );

  readonly currentUser = this._currentUser.asReadonly();

  readonly isLoggedIn = computed(
    () => this._currentUser() !== null
  );

  /**
   * Read the currently logged-in user
   * from localStorage.
   */
  private readStoredUser(): User | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return null;
      }

      const parsed: StoredAuth = JSON.parse(raw);

      return parsed.user ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Save the authentication session.
   *
   * The password is NOT stored here.
   */
  private persistSession(res: AuthResponse): void {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(res)
    );

    this._currentUser.set(res.user);
  }

  /**
   * Creates a User object used by the application.
   *
   * The role comes directly from the mock database
   * during login.
   *
   * During registration, the role comes from the
   * registration form.
   */
  private mockUserFrom(payload: {
    fullName?: string;
    email: string;
    role?: User['role'];
  }): User {
    const fullName =
      payload.fullName ??
      payload.email.split('@')[0];

    const role =
      payload.role ?? 'student';

    return {
      id:
        'usr_' +
        Math.random()
          .toString(36)
          .slice(2, 10),

      fullName,

      email: payload.email,

      role,

      /**
       * Only students need a student ID.
       */
      studentId:
        role === 'student'
          ? 'CLD-' +
            Math.floor(
              100000 +
                Math.random() * 900000
            )
          : undefined,

      avatarUrl:
        `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(
          fullName
        )}`,

      enrolledCourseIds:
        role === 'student'
          ? ['c1', 'c3', 'c5']
          : [],

      completedCourseIds:
        role === 'student'
          ? ['c1']
          : [],

      createdAt:
        new Date().toISOString(),
    };
  }

  /**
   * Login using the temporary mock database.
   *
   * The email AND password must match
   * a user inside MOCK_USERS.
   *
   * The user's role is retrieved from
   * the mock database.
   */
  login(
    payload: LoginPayload
  ): Observable<AuthResponse> {
    if (
      !payload.email ||
      !payload.password
    ) {
      return throwError(
        () =>
          new Error(
            'Email and password are required.'
          )
      );
    }

    /**
     * Normalize the email so that:
     *
     * ADMIN@CLOUDPATH.COM
     *
     * and
     *
     * admin@cloudpath.com
     *
     * are treated as the same email.
     */
    const email =
      payload.email
        .trim()
        .toLowerCase();

    /**
     * Find the user in our temporary database.
     *
     * Both email and password must match.
     */
    const userRecord =
      MOCK_USERS.find(
        (user) =>
          user.email
            .toLowerCase() === email &&
          user.password ===
            payload.password
      );

    /**
     * No matching user found.
     */
    if (!userRecord) {
      return throwError(
        () =>
          new Error(
            'Invalid email or password.'
          )
      );
    }

    /**
     * Create the authenticated User object.
     *
     * Notice that we intentionally do NOT
     * copy the password.
     */
    const user: User = {
      id: userRecord.id,

      fullName:
        userRecord.fullName,

      email:
        userRecord.email,

      /**
       * IMPORTANT:
       *
       * This role comes directly from
       * mock-db.ts.
       */
      role:
        userRecord.role,

      studentId:
        userRecord.studentId,

      avatarUrl:
        userRecord.avatarUrl,

      enrolledCourseIds:
        userRecord.enrolledCourseIds,

      completedCourseIds:
        userRecord.completedCourseIds,

      createdAt:
        userRecord.createdAt,
    };

    /**
     * Create a temporary JWT-like token.
     */
    const res: AuthResponse = {
      user,

      token:
        'mock-jwt-' +
        Math.random()
          .toString(36)
          .slice(2),
    };

    /**
     * Simulate API delay.
     *
     * Then save the authenticated session.
     */
    return of(res).pipe(
      delay(700),

      tap((response) => {
        this.persistSession(response);
      })
    );
  }

  /**
   * Save registration information temporarily.
   *
   * The selected role is also saved here.
   */
  register(
    payload: RegisterPayload
  ): Observable<{ email: string }> {
    sessionStorage.setItem(
      PENDING_KEY,
      JSON.stringify(payload)
    );

    return of({
      email: payload.email,
    }).pipe(
      delay(1200)
    );
  }

  /**
   * Verify the OTP during registration.
   */
  verifyOtp(
    otp: string
  ): Observable<AuthResponse> {
    const pendingRaw =
      sessionStorage.getItem(
        PENDING_KEY
      );

    /**
     * No registration found.
     */
    if (!pendingRaw) {
      return throwError(
        () =>
          new Error(
            'No pending registration found. Please register again.'
          )
      );
    }

    /**
     * OTP must contain exactly 6 digits.
     */
    if (
      otp.length !== 6
    ) {
      return throwError(
        () =>
          new Error(
            'Enter the complete 6-digit code.'
          )
      );
    }

    /**
     * Mock failure code.
     */
    if (otp === '000000') {
      return throwError(
        () =>
          new Error(
            'That code is incorrect. Please try again.'
          )
      );
    }

    /**
     * Retrieve registration details.
     */
    const pending:
      RegisterPayload =
        JSON.parse(
          pendingRaw
        );

    /**
     * Create the new authenticated user.
     *
     * The role selected during registration
     * is preserved here.
     */
    const res: AuthResponse = {
      user:
        this.mockUserFrom({
          fullName:
            pending.fullName,

          email:
            pending.email,

          role:
            pending.role,
        }),

      token:
        'mock-jwt-' +
        Math.random()
          .toString(36)
          .slice(2),
    };

    return of(res).pipe(
      delay(900),

      tap((response) => {
        /**
         * Log the newly registered user in.
         */
        this.persistSession(
          response
        );

        /**
         * Registration is complete,
         * so remove the pending data.
         */
        sessionStorage.removeItem(
          PENDING_KEY
        );
      })
    );
  }

  /**
   * Resend OTP.
   */
  resendOtp(): Observable<{
    sent: boolean;
  }> {
    return of({
      sent: true,
    }).pipe(
      delay(700)
    );
  }

  /**
   * Get the email from the pending
   * registration.
   */
  getPendingEmail(): string | null {
    const raw =
      sessionStorage.getItem(
        PENDING_KEY
      );

    if (!raw) {
      return null;
    }

    return (
      JSON.parse(
        raw
      ) as RegisterPayload
    ).email;
  }

  /**
   * Logout the current user.
   */
  logout(): void {
    localStorage.removeItem(
      STORAGE_KEY
    );

    this._currentUser.set(
      null
    );
  }

  /**
   * Get the stored JWT-like token.
   */
  getToken(): string | null {
    try {
      const raw =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (!raw) {
        return null;
      }

      return (
        JSON.parse(
          raw
        ) as StoredAuth
      ).token ?? null;
    } catch {
      return null;
    }
  }
}

