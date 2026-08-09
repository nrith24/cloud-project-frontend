import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RecaptchaPlaceholderComponent } from '../../../shared/components/recaptcha-placeholder/recaptcha-placeholder.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RecaptchaPlaceholderComponent],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  // 1. Inject dependencies directly as class fields
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly loading = signal(false);
  readonly showPassword = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly captchaVerified = signal(false);

  // 2. This can now safely reference 'this.fb' during initialization
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  // 3. Keep an empty constructor since parameters have been moved out
  constructor() {}

  get f() {
    return this.form.controls;
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  onCaptchaChecked(v: boolean): void {
    this.captchaVerified.set(v);
  }

  submit(): void {
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.captchaVerified()) {
      this.errorMessage.set('Please verify that you are not a robot.');
      return;
    }

    this.loading.set(true);
    const { email, password, rememberMe } = this.form.getRawValue();

    this.auth.login({ email, password, rememberMe }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.errorMessage.set(err.message || 'Something went wrong. Please try again.');
      },
    });
  }

  loginWithGoogle(): void {
    // UI-only placeholder — wire up real OAuth once backend team exposes the endpoint.
    this.errorMessage.set('Google login will be available once backend authentication is connected.');
  }
}
