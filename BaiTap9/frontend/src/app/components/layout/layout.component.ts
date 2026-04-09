import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="layout">
      <nav class="sidebar">
        <div class="logo">
          <h2>Metro System</h2>
          <p>BaiTap9</p>
        </div>
        <ul class="nav-menu">
          <li><a routerLink="/dashboard" routerLinkActive="active">Dashboard</a></li>
          @if (hasRole('staff', 'admin')) {
            <li><a routerLink="/ticket-validation" routerLinkActive="active">Validate Ticket</a></li>
          }
          @if (hasRole('inspector', 'admin')) {
            <li><a routerLink="/manual-inspection" routerLinkActive="active">Manual Inspection</a></li>
          }
          @if (hasRole('admin')) {
            <li><a routerLink="/admin/users" routerLinkActive="active">Admin Users</a></li>
          }
        </ul>
        <div class="user-info">
          @if (user()) {
            <div class="user-avatar">{{ user()!.name?.charAt(0)?.toUpperCase() ?? '' }}</div>
            <div class="user-details">
              <span class="user-name">{{ user()!.name }}</span>
              <span class="user-role badge-{{ user()!.role }}">{{ user()!.role }}</span>
            </div>
          }
          <button (click)="logout()" class="logout-btn">Logout</button>
        </div>
      </nav>
      <main class="content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .layout { display: flex; min-height: 100vh; }
    .sidebar { width: 260px; background: #1a1a2e; color: white; padding: 20px; display: flex; flex-direction: column; }
    .logo h2 { margin: 0; font-size: 1.3rem; color: #00d9ff; }
    .logo p { margin: 4px 0 0; font-size: 0.8rem; color: #666; }
    .nav-menu { list-style: none; padding: 20px 0; margin: 0; flex: 1; }
    .nav-menu li { margin-bottom: 4px; }
    .nav-menu a { color: #a0a0a0; text-decoration: none; display: block; padding: 10px 16px; border-radius: 8px; font-size: 0.95rem; transition: all 0.2s; }
    .nav-menu a:hover { color: white; background: rgba(255,255,255,0.08); }
    .nav-menu a.active { color: white; background: #00d9ff22; border-left: 3px solid #00d9ff; }
    .user-info { border-top: 1px solid #2a2a4a; padding-top: 16px; }
    .user-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.1rem; margin-bottom: 8px; }
    .user-details { margin-bottom: 12px; }
    .user-name { display: block; font-weight: 500; font-size: 0.9rem; }
    .user-role { display: inline-block; font-size: 0.7rem; padding: 2px 8px; border-radius: 4px; margin-top: 4px; text-transform: uppercase; }
    .badge-passenger { background: #1e40af22; color: #60a5fa; }
    .badge-staff { background: #16653422; color: #4ade80; }
    .badge-inspector { background: #92400e22; color: #fb923c; }
    .badge-admin { background: #7f1d1d22; color: #f87171; }
    .logout-btn { width: 100%; padding: 8px; border: none; border-radius: 6px; background: #2a2a4a; color: #a0a0a0; cursor: pointer; font-size: 0.85rem; }
    .logout-btn:hover { background: #3a3a6a; color: white; }
    .content { flex: 1; padding: 24px; overflow-y: auto; background: #f8fafc; }
  `],
})
export class LayoutComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  user = signal<User | null>(null);

  ngOnInit() {
    this.auth.user$.subscribe((u) => this.user.set(u));
  }

  hasRole(...roles: string[]): boolean {
    return this.auth.hasRole(...roles);
  }

  logout() {
    this.auth.logout();
  }
}
