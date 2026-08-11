
import { Routes } from '@angular/router';

import {
  authGuard,
  guestGuard,
  roleGuard,
} from './core/guards/auth.guard';

import {
  initialSkillSetupGuard,
} from './core/guards/initial-skill-setup.guard';

export const routes: Routes = [

  // -----------------------------------------
  // Landing Page
  // -----------------------------------------
  {
    path: '',
    loadComponent: () =>
      import(
        './features/landing/landing.component'
      ).then(
        (m) => m.LandingComponent
      ),
    title:
      'CloudPath — Master Cloud & DevOps Skills',
  },


  // -----------------------------------------
  // Login
  // -----------------------------------------
  {
    path: 'login',
    loadComponent: () =>
      import(
        './features/auth/login/login.component'
      ).then(
        (m) => m.LoginComponent
      ),
    canActivate: [
      guestGuard
    ],
    title: 'Log in — CloudPath',
  },


  // -----------------------------------------
  // Register
  // -----------------------------------------
  {
    path: 'register',
    loadComponent: () =>
      import(
        './features/auth/register/register.component'
      ).then(
        (m) => m.RegisterComponent
      ),
    canActivate: [
      guestGuard
    ],
    title: 'Create account — CloudPath',
  },


  // -----------------------------------------
  // Verify OTP
  // -----------------------------------------
  {
    path: 'verify-otp',
    loadComponent: () =>
      import(
        './features/auth/verify-otp/verify-otp.component'
      ).then(
        (m) => m.VerifyOtpComponent
      ),
    title: 'Verify email — CloudPath',
  },


  // -----------------------------------------
  // Initial Student Skill Setup
  // -----------------------------------------
  {
    path: 'skill-setup',
    loadComponent: () =>
      import(
        './features/skill-setup/skill-setup.component'
      ).then(
        (m) => m.SkillSetupComponent
      ),

    /**
     * Only a newly registered student who
     * still needs to complete skill setup
     * can access this page.
     */
    canActivate: [
      initialSkillSetupGuard
    ],

    title:
      'Set Up Your Skills — CloudPath',
  },


  // -----------------------------------------
  // Student Dashboard
  // -----------------------------------------
  {
    path: 'dashboard',
    loadComponent: () =>
      import(
        './features/dashboard/dashboard.component'
      ).then(
        (m) => m.DashboardComponent
      ),

    canActivate: [
      authGuard,
      roleGuard('student'),
    ],

    title: 'Dashboard — CloudPath',
  },


  // -----------------------------------------
  // Admin Dashboard
  // -----------------------------------------
  {
    path: 'admin',
    loadComponent: () =>
      import(
        './features/admin/admin.component'
      ).then(
        (m) => m.AdminComponent
      ),

    canActivate: [
      authGuard,
      roleGuard('admin'),
    ],

    title:
      'Admin Dashboard — CloudPath',
  },


  // -----------------------------------------
  // Instructor Dashboard
  // -----------------------------------------
  {
    path: 'instructor',
    loadComponent: () =>
      import(
        './features/instructor/instructor.component'
      ).then(
        (m) => m.InstructorComponent
      ),

    canActivate: [
      authGuard,
      roleGuard('instructor'),
    ],

    title:
      'Instructor Dashboard — CloudPath',
  },


  // -----------------------------------------
  // About
  // -----------------------------------------
  {
    path: 'about',
    loadComponent: () =>
      import(
        './features/about/about.component'
      ).then(
        (m) => m.AboutComponent
      ),
    title: 'About — CloudPath',
  },


  // -----------------------------------------
  // Contact
  // -----------------------------------------
  {
    path: 'contact',
    loadComponent: () =>
      import(
        './features/contact/contact.component'
      ).then(
        (m) => m.ContactComponent
      ),
    title: 'Contact — CloudPath',
  },


  // -----------------------------------------
  // Page Not Found
  // -----------------------------------------
  {
    path: '**',
    loadComponent: () =>
      import(
        './shared/components/not-found/not-found.component'
      ).then(
        (m) => m.NotFoundComponent
      ),
    title:
      'Page not found — CloudPath',
  },
];

