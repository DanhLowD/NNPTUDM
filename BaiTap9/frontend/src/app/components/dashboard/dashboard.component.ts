import { Component, OnInit, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard">
      <div class="card">
        <h1>Dashboard</h1>
        <p>Welcome to Metro Ticket Management System</p>
      </div>

      <div class="card">
        <div class="user-info">
          <div class="avatar">{{ user()?.name?.charAt(0)?.toUpperCase() }}</div>
          <div>
            <h2>{{ user()?.name }}</h2>
            <p>{{ user()?.email }}</p>
            <span class="role-badge role-{{ user()?.role }}">{{ user()?.role?.toUpperCase() }}</span>
          </div>
        </div>
      </div>

      <div class="card">
        <h3>Your Role</h3>
        <p>{{ roleDescription() }}</p>
      </div>

      <div class="card">
        <h3>Features</h3>
        <div class="features">
          @for (feature of features(); track feature) {
            <div class="feature-item">
              <span class="dot"></span>
              {{ feature }}
            </div>
          }
        </div>
      </div>

      @if (hasRole('admin')) {
        <div class="card">
          <h3>Quick Actions</h3>
          <div class="actions">
            <a href="/admin/users" class="btn btn-red">Manage Users</a>
            <a href="/ticket-validation" class="btn btn-green">Validate Ticket</a>
            <a href="/manual-inspection" class="btn btn-orange">Manual Inspection</a>
          </div>
        </div>
      }

      @if (hasRole('staff')) {
        <div class="card">
          <h3>Quick Actions</h3>
          <div class="actions">
            <a href="/ticket-validation" class="btn btn-green">Validate Ticket</a>
          </div>
        </div>
      }

      @if (hasRole('inspector')) {
        <div class="card">
          <h3>Quick Actions</h3>
          <div class="actions">
            <a href="/manual-inspection" class="btn btn-orange">Manual Inspection</a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard { max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
    .card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h1 { font-size: 1.8rem; margin: 0 0 8px; color: #1e293b; }
    p { color: #64748b; margin: 0; }
    .user-info { display: flex; gap: 16px; align-items: center; }
    .avatar { width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; font-weight: bold; }
    h2 { margin: 0; font-size: 1.2rem; color: #1e293b; }
    .user-info p { margin: 4px 0; }
    .role-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; margin-top: 8px; }
    .role-passenger { background: #dbeafe; color: #1d4ed8; }
    .role-staff { background: #dcfce7; color: #15803d; }
    .role-inspector { background: #ffedd5; color: #c2410c; }
    .role-admin { background: #fee2e2; color: #dc2626; }
    h3 { font-size: 1.1rem; margin: 0 0 12px; color: #1e293b; }
    .features { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .feature-item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #f8fafc; border-radius: 8px; font-size: 0.9rem; color: #475569; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: #3b82f6; flex-shrink: 0; }
    .actions { display: flex; gap: 12px; flex-wrap: wrap; }
    .btn { padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.9rem; display: inline-block; }
    .btn-red { background: #dc2626; color: white; }
    .btn-red:hover { background: #b91c1c; }
    .btn-green { background: #16a34a; color: white; }
    .btn-green:hover { background: #15803d; }
    .btn-orange { background: #ea580c; color: white; }
    .btn-orange:hover { background: #c2410c; }
  `],
})
export class DashboardComponent implements OnInit {
  private auth = inject(AuthService);
  user = signal<User | null>(null);

  ngOnInit() {
    this.auth.user$.subscribe((u) => this.user.set(u));
  }

  hasRole(...roles: string[]): boolean {
    return this.auth.hasRole(...roles);
  }

  roleDescription(): string {
    const descriptions: Record<string, string> = {
      passenger: 'Hanh khach - Su dung he thong metro',
      staff: 'Nhan vien - Quan ly ve tai cong vao',
      inspector: 'Kiem soat vien - Kiem tra ve thu cong',
      admin: 'Quan tri vien - Quan ly he thong',
    };
    return descriptions[this.user()?.role || ''] || '';
  }

  features(): string[] {
    const featureMap: Record<string, string[]> = {
      passenger: ['Xem thong tin tai khoan', 'Mua ve metro', 'Lich su giao dich'],
      staff: ['Kiem tra ve tai cong vao', 'Xac nhan hop le ve', 'Bao cao su co'],
      inspector: ['Kiem tra thu cong', 'Lap bien ban vi pham', 'Xem lich su kiem tra'],
      admin: ['Quan ly nguoi dung', 'Quan ly ve', 'Xem bao cao thong ke', 'Cau hinh he thong'],
    };
    return featureMap[this.user()?.role || ''] || [];
  }
}
