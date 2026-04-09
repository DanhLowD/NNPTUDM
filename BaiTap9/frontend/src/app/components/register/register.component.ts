import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  template: `
    <div class="register-page">
      <div class="register-card">
        <h1>Create Account</h1>
        <p>Sign up for Metro Ticket Management</p>

        @if (error()) {
          <div class="alert error">{{ error() }}</div>
        }
        @if (success()) {
          <div class="alert success">Registration successful! Redirecting...</div>
        }

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" [(ngModel)]="name" name="name" placeholder="Enter your full name" required />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" name="email" placeholder="Enter your email" required />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" placeholder="Min 6 characters" required />
          </div>
          <div class="form-group">
            <label>Confirm Password</label>
            <input type="password" [(ngModel)]="confirmPassword" name="confirmPassword" placeholder="Confirm your password" required />
          </div>
          <button type="submit" [disabled]="loading()">Sign up</button>
        </form>

        <p class="login-link">
          Already have an account? <a href="/login">Sign in</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .register-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f8fafc; padding: 20px; }
    .register-card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 100%; max-width: 420px; }
    h1 { font-size: 1.8rem; margin: 0 0 8px; color: #1e293b; text-align: center; }
    p { color: #64748b; text-align: center; margin: 0 0 24px; }
    .form-group { margin-bottom: 16px; }
    label { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 6px; }
    input { width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.95rem; box-sizing: border-box; }
    input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
    button { width: 100%; padding: 12px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; }
    button:hover:not(:disabled) { background: #2563eb; }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    .alert { padding: 12px; border-radius: 8px; margin-bottom: 16px; font-size: 0.9rem; }
    .alert.error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    .alert.success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
    .login-link { text-align: center; margin-top: 16px; color: #64748b; font-size: 0.9rem; }
    .login-link a { color: #3b82f6; text-decoration: none; font-weight: 500; }
    .login-link a:hover { text-decoration: underline; }
  `],
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = signal(false);
  error = signal('');
  success = signal(false);

  onSubmit() {
    this.error.set('');
    this.success.set(false);

    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      this.error.set('Please fill in all fields');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      this.error.set('Please enter a valid email');
      return;
    }
    if (this.password.length < 6) {
      this.error.set('Password must be at least 6 characters');
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error.set('Passwords do not match');
      return;
    }

    this.loading.set(true);
    this.auth.register(this.name, this.email, this.password).subscribe({
      next: () => {
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/login']), 2000);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        const e = err as { message?: string };
        this.error.set(e.message || 'Registration failed');
        this.loading.set(false);
      },
    });
  }
}
