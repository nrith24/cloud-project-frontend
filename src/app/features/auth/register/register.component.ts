import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    AbstractControl,
    FormBuilder,
    ReactiveFormsModule,
    ValidationErrors,
    Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Password strength validator
 *
 * Password must contain:
 * - Uppercase letter
 * - Lowercase letter
 * - Number
 * - Special character
 */
function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value || '';

    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[^A-Za-z0-9]/.test(value);

    const valid = hasUpper && hasLower && hasNumber && hasSpecial;

    return valid ? null : { weakPassword: true };
}

/**
 * Password confirmation validator
 */
function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;

    return password && confirm && password !== confirm ? { mismatch: true } : null;
}

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink,
    ],
    templateUrl: './register.component.html',
})
export class RegisterComponent {
    // -----------------------------------------
    // DEPENDENCIES
    // -----------------------------------------
    private fb = inject(FormBuilder);
    private auth = inject(AuthService);
    private router = inject(Router);

    // -----------------------------------------
    // UI STATE
    // -----------------------------------------
    readonly loading = signal(false);
    readonly showPassword = signal(false);
    readonly showConfirmPassword = signal(false);
    readonly errorMessage = signal<string | null>(null);

    // -----------------------------------------
    // REGISTRATION FORM
    // -----------------------------------------
    readonly form = this.fb.nonNullable.group(
        {
            fullName: [
                '',
                [
                    Validators.required,
                    Validators.minLength(2),
                ],
            ],
            email: [
                '',
                [
                    Validators.required,
                    Validators.email,
                ],
            ],
            role: [
                '',
                [
                    Validators.required,
                ],
            ],
            password: [
                '',
                [
                    Validators.required,
                    Validators.minLength(8),
                    passwordStrengthValidator,
                ],
            ],
            confirmPassword: [
                '',
                [
                    Validators.required,
                ],
            ],
            acceptTerms: [
                false,
                [
                    Validators.requiredTrue,
                ],
            ],
        },
        {
            validators: passwordsMatchValidator,
        }
    );

    // -----------------------------------------
    // PASSWORD STRENGTH
    // -----------------------------------------
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

    readonly strengthScore = computed(() => 
        Object.values(this.strengthChecks()).filter(Boolean).length
    );

    // Returns a 5-element iterable index array for template tracking bars
    readonly strengthBars = computed(() => [0, 1, 2, 3, 4]);

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

    // -----------------------------------------
    // FORM CONTROLS
    // -----------------------------------------
    get f() {
        return this.form.controls;
    }

    // -----------------------------------------
    // PASSWORD VISIBILITY
    // -----------------------------------------
    togglePassword(): void {
        this.showPassword.update((value) => !value);
    }

    toggleConfirmPassword(): void {
        this.showConfirmPassword.update((value) => !value);
    }

    // -----------------------------------------
    // REGISTER
    // -----------------------------------------
    submit(): void {
        // Clear previous error
        this.errorMessage.set(null);

        // Validate form
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        // Start loading
        this.loading.set(true);

        // Get form values
        const { fullName, email, password, role } = this.form.getRawValue();

        /**
         * AuthService.register() will:
         * 1. Save registration details
         * 2. Generate a random 6-digit OTP
         * 3. Store OTP in sessionStorage
         * 4. Log the OTP in the browser console
         * 5. Return success
         */
        this.auth
            .register({
                fullName,
                email,
                password,
                role: role as 'student' | 'instructor', // Fixed TS2322 Type Mismatch
            })
            .subscribe({
                // -----------------------------------
                // REGISTRATION SUCCESS
                // -----------------------------------
                next: (response) => {
                    this.loading.set(false);
                    console.log('Registration successful.');
                    console.log('OTP verification required for:', response.email);

                    /**
                     * Go to OTP verification page.
                     * The pending registration and OTP are already stored by AuthService.
                     */
                    this.router.navigate(['/verify-otp']);
                },
                // -----------------------------------
                // REGISTRATION ERROR
                // -----------------------------------
                error: (err: Error) => {
                    this.loading.set(false);
                    this.errorMessage.set(
                        err.message || 'Something went wrong. Please try again.'
                    );
                },
            });
    }
}
