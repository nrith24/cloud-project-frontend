
import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { OtpInputComponent } from '../../../shared/components/otp-input/otp-input.component';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [
    RouterLink,
    OtpInputComponent,
  ],
  templateUrl: './verify-otp.component.html',
})
export class VerifyOtpComponent implements OnInit, OnDestroy {

  // -----------------------------------------
  // OTP INPUT COMPONENT
  // -----------------------------------------
  @ViewChild(OtpInputComponent)
  otpInput!: OtpInputComponent;


  // -----------------------------------------
  // PAGE STATE
  // -----------------------------------------
  readonly email = signal<string | null>(null);
  readonly code = signal('');
  readonly loading = signal(false);
  readonly hasError = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly verified = signal(false);
  readonly resending = signal(false);
  readonly countdown = signal(30);


  // -----------------------------------------
  // TIMER
  // -----------------------------------------
  private timer: ReturnType<typeof setInterval> | null = null;


  // -----------------------------------------
  // CONSTRUCTOR
  // -----------------------------------------
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}


  // -----------------------------------------
  // INIT
  // -----------------------------------------
  ngOnInit(): void {

    // Get email from pending registration
    const pendingEmail =
      this.auth.getPendingEmail();

    this.email.set(pendingEmail);

    // If there is no pending registration,
    // show an error.
    if (!pendingEmail) {

      this.errorMessage.set(
        'No pending registration found. Please register again.'
      );

      this.hasError.set(true);

      return;
    }

    // Start resend countdown
    this.startCountdown();
  }


  // -----------------------------------------
  // DESTROY
  // -----------------------------------------
  ngOnDestroy(): void {

    if (this.timer) {

      clearInterval(this.timer);

      this.timer = null;
    }
  }


  // -----------------------------------------
  // COUNTDOWN
  // -----------------------------------------
  private startCountdown(): void {

    this.countdown.set(30);

    // Clear previous timer
    if (this.timer) {

      clearInterval(this.timer);
    }

    this.timer = setInterval(() => {

      this.countdown.update(
        (value) =>
          value > 0
            ? value - 1
            : 0
      );

      // Stop timer when countdown reaches 0
      if (
        this.countdown() === 0 &&
        this.timer
      ) {

        clearInterval(this.timer);

        this.timer = null;
      }

    }, 1000);
  }


  // -----------------------------------------
  // OTP INPUT CHANGE
  // -----------------------------------------
  onCodeChange(code: string): void {

    // Store entered OTP
    this.code.set(code);

    // Clear previous error
    this.hasError.set(false);
    this.errorMessage.set(null);
  }


  // -----------------------------------------
  // OTP COMPLETED
  // -----------------------------------------
  onCompleted(code: string): void {

    // Automatically verify when all
    // 6 digits are entered.
    this.verify(code);
  }


  // -----------------------------------------
  // VERIFY OTP
  // -----------------------------------------
  verify(code = this.code()): void {

    // Prevent duplicate verification
    if (this.loading()) {
      return;
    }

    // Check OTP length
    if (
      !code ||
      code.length !== 6
    ) {

      this.hasError.set(true);

      this.errorMessage.set(
        'Enter the complete 6-digit code.'
      );

      return;
    }

    // Start loading
    this.loading.set(true);

    // Clear previous errors
    this.hasError.set(false);
    this.errorMessage.set(null);


    /**
     * AuthService.verifyOtp() will:
     *
     * 1. Read the pending registration.
     * 2. Validate the OTP.
     * 3. Create the new user.
     * 4. Create the authentication session.
     * 5. Remove the pending registration.
     */
    this.auth
      .verifyOtp(code)
      .subscribe({

        // -----------------------------------
        // OTP SUCCESS
        // -----------------------------------
        next: () => {

          this.loading.set(false);

          this.verified.set(true);

          this.hasError.set(false);

          this.errorMessage.set(null);


          /**
           * The OTP verification is complete.
           *
           * AuthService has already created the
           * authenticated user session.
           *
           * Now we check the user's role.
           */
          const user =
            this.auth.currentUser();


          setTimeout(() => {

            // ---------------------------------
            // STUDENT
            // ---------------------------------
            if (
              user?.role === 'student'
            ) {

              /**
               * This is a newly registered student.
               *
               * Mark that the student must complete
               * the initial skill setup.
               *
               * The flag is stored in sessionStorage.
               */
              this.auth
                .markInitialSkillSetupRequired();


              /**
               * Keep the authentication session active
               * while the student enters their skills.
               *
               * The skill setup page will save the
               * skills and then logout the student.
               */
              this.router.navigate([
                '/skill-setup'
              ]);

              return;
            }


            // ---------------------------------
            // INSTRUCTOR / ADMIN
            // ---------------------------------
            /**
             * Instructors and admins do NOT need
             * the initial skill setup.
             *
             * They continue to the normal dashboard.
             */
            this.router.navigate([
              '/dashboard'
            ]);

          }, 1400);
        },


        // -----------------------------------
        // OTP ERROR
        // -----------------------------------
        error: (err: Error) => {

          this.loading.set(false);

          this.hasError.set(true);

          this.errorMessage.set(
            err.message ||
            'Incorrect OTP. Please try again.'
          );

          // Clear OTP input boxes
          this.otpInput?.reset();
        },
      });
  }


  // -----------------------------------------
  // RESEND OTP
  // -----------------------------------------
  resend(): void {

    // Don't resend while countdown is still active.
    if (
      this.countdown() > 0 ||
      this.resending()
    ) {
      return;
    }

    // Start resend loading state
    this.resending.set(true);

    // Clear previous error
    this.hasError.set(false);
    this.errorMessage.set(null);


    /**
     * AuthService.resendOtp() will:
     *
     * 1. Generate a NEW 6-digit OTP.
     * 2. Replace the old OTP.
     * 3. Print the new OTP in the browser console.
     */
    this.auth
      .resendOtp()
      .subscribe({

        // -----------------------------------
        // RESEND SUCCESS
        // -----------------------------------
        next: () => {

          this.resending.set(false);

          // Clear existing OTP input
          this.code.set('');

          this.otpInput?.reset();

          // Restart 30-second countdown
          this.startCountdown();

          console.log(
            'A new OTP has been generated.'
          );
        },


        // -----------------------------------
        // RESEND ERROR
        // -----------------------------------
        error: (err: Error) => {

          this.resending.set(false);

          this.hasError.set(true);

          this.errorMessage.set(
            err.message ||
            'Unable to resend OTP. Please try again.'
          );
        },
      });
  }
}

