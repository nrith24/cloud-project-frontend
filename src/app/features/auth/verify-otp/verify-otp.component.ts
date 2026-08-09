import { Component, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { OtpInputComponent } from '../../../shared/components/otp-input/otp-input.component';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [RouterLink, OtpInputComponent],
  templateUrl: './verify-otp.component.html',
})
export class VerifyOtpComponent implements OnInit, OnDestroy {
  @ViewChild(OtpInputComponent) otpInput!: OtpInputComponent;

  readonly email = signal<string | null>(null);
  readonly code = signal('');
  readonly loading = signal(false);
  readonly hasError = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly verified = signal(false);
  readonly resending = signal(false);
  readonly countdown = signal(30);

  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.email.set(this.auth.getPendingEmail());
    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private startCountdown(): void {
    this.countdown.set(30);
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.countdown.update((v) => (v > 0 ? v - 1 : 0));
      if (this.countdown() === 0 && this.timer) {
        clearInterval(this.timer);
      }
    }, 1000);
  }

  onCodeChange(code: string): void {
    this.code.set(code);
    this.hasError.set(false);
    this.errorMessage.set(null);
  }

  onCompleted(code: string): void {
    this.verify(code);
  }

  verify(code = this.code()): void {
    if (code.length !== 6) {
      this.hasError.set(true);
      this.errorMessage.set('Enter the complete 6-digit code.');
      return;
    }
    this.loading.set(true);
    this.auth.verifyOtp(code).subscribe({
      next: () => {
        this.loading.set(false);
        this.verified.set(true);
        setTimeout(() => this.router.navigate(['/dashboard']), 1400);
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.hasError.set(true);
        this.errorMessage.set(err.message);
        this.otpInput?.reset();
      },
    });
  }

  resend(): void {
    if (this.countdown() > 0 || this.resending()) return;
    this.resending.set(true);
    this.auth.resendOtp().subscribe(() => {
      this.resending.set(false);
      this.startCountdown();
    });
  }
}
