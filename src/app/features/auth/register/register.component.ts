import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value || '';
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSpecial = /[^A-Za-z0-9]/.test(value);
  const valid = hasUpper && hasLower && hasNumber && hasSpecial;
  return valid ? null : { weakPassword: true };
}

function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { mismatch: true } : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  // 1. Inject dependencies directly into class properties
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly loading = signal(false);
  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);
  readonly errorMessage = signal<string | null>(null);

  // 2. Form initialization can now safely reference 'this.fb'
  readonly form = this.fb.nonNullable.group(
    {
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]],
    },
    { validators: passwordsMatchValidator }
  );

  readonly passwordValue = computed(() => this.form.controls.password.value ?? '');

  readonly strengthChecks = computed(() => {
    const v = this.passwordValue();
    return {
      length: v.length >= 8,
      upper: /[A-Z]/.test(v),
      lower: /[a-z]/.test(v),
      number: /[0-9]/.test(v),
      special: /[^A-Za-z0-9]/.test(v),
    };
  });

  readonly strengthScore = computed(() => Object.values(this.strengthChecks()).filter(Boolean).length);

  readonly strengthLabel = computed(() => {
    const score = this.strengthScore();
    if (score <= 2) return 'Weak';
    if (score <= 4) return 'Fair';
    return 'Strong';
  });

  readonly strengthColor = computed(() => {
    const score = this.strengthScore();
    if (score <= 2) return 'bg-red-400';
    if (score <= 4) return 'bg-amber-400';
    return 'bg-emerald-500';
  });

  // 3. Clear constructor parameters
  constructor() {}

  get f() {
    return this.form.controls;
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((v) => !v);
  }

  submit(): void {
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { fullName, email, password } = this.form.getRawValue();

    this.auth.register({ fullName, email, password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/verify-otp']);
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.errorMessage.set(err.message || 'Something went wrong. Please try again.');
      },
    });
  }
}
