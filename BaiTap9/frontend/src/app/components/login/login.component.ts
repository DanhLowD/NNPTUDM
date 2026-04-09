import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <h1>Metro Ticket Management</h1>
        <p>Sign in to your account</p>

        @if (error()) {
          <div class="alert error">{{ error() }}</div>
        }

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" name="email" placeholder="Enter your email" required />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" placeholder="Enter your password" required />
          </div>
          <button type="submit" [disabled]="loading()">Sign in</button>
        </form>

        <p class="register-link">
          Don't have an account? <a href="/register">Sign up</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f8fafc; padding: 20px; }
    .login-card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 100%; max-width: 420px; }
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
    .register-link { text-align: center; margin-top: 16px; color: #64748b; font-size: 0.9rem; }
    .register-link a { color: #3b82f6; text-decoration: none; font-weight: 500; }
    .register-link a:hover { text-decoration: underline; }
  `],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  onSubmit() {
    this.error.set('');

    if (!this.email || !this.password) {
      this.error.set('Please fill in all fields');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      this.error.set('Please enter a valid email');
      return;
    }

    this.loading.set(true);
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err: unknown) => {
        const e = err as { message?: string };
        this.error.set(e.message || 'Login failed');
        this.loading.set(false);
      },
    });
  }
}
