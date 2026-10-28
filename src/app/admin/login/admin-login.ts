import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.scss'
})
export class AdminLogin {

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  username = '';
  password = '';

  loading = false;
  errorMessage = '';

  submit(): void {
    if (
      !this.username.trim() ||
      !this.password
    ) {
      this.errorMessage = 'Enter your username and password.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(
      this.username.trim(),
      this.password
    ).subscribe({
      next: user => {
        this.loading = false;

        if (user.roles.includes('ROLE_ADMIN')) {
          void this.router.navigateByUrl('/admin');
        } else {
          this.errorMessage = 'Administrator access is required.';
        }
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;

        this.errorMessage = error.status === 401
          ? 'Invalid username or password.'
          : 'Login failed. Check the server and security configuration, then try again.';
      }
    });
  }
}