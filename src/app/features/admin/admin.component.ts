import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { AdminService } from '../../core/services/admin.service';

import {
  AdminCourse,
  AdminStats,
  AdminUser,
} from '../../core/models/admin.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.component.html',
})
export class AdminComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);

  readonly currentUser = this.auth.currentUser;

  readonly stats = signal<AdminStats | null>(null);

  readonly users = signal<AdminUser[]>([]);
  readonly courses = signal<AdminCourse[]>([]);

  readonly searchTerm = signal('');
  readonly selectedRole = signal<'all' | 'student' | 'instructor' | 'admin'>(
    'all'
  );

  readonly loading = signal(true);

  readonly filteredUsers = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    const role = this.selectedRole();

    return this.users().filter((user) => {
      const matchesSearch =
        !search ||
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search);

      const matchesRole =
        role === 'all' || user.role === role;

      return matchesSearch && matchesRole;
    });
  });

  ngOnInit(): void {
    if (this.currentUser()?.role !== 'admin') {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.loadAdminData();
  }

  private loadAdminData(): void {
    this.loading.set(true);

    this.adminService.getStats().subscribe((stats) => {
      this.stats.set(stats);
    });

    this.adminService.getUsers().subscribe((users) => {
      this.users.set(users);
      this.loading.set(false);
    });

    this.adminService.getCourses().subscribe((courses) => {
      this.courses.set(courses);
    });
  }

  updateSearch(value: string): void {
    this.searchTerm.set(value);
  }

  updateRole(value: string): void {
    this.selectedRole.set(
      value as 'all' | 'student' | 'instructor' | 'admin'
    );
  }

  roleLabel(role: AdminUser['role']): string {
    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  roleBadgeClass(role: AdminUser['role']): string {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700';

      case 'instructor':
        return 'bg-blue-100 text-blue-700';

      case 'student':
      default:
        return 'bg-emerald-100 text-emerald-700';
    }
  }

  progressClass(progress: number): string {
    if (progress >= 80) {
      return 'bg-emerald-500';
    }

    if (progress >= 50) {
      return 'bg-blue-500';
    }

    return 'bg-amber-500';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}