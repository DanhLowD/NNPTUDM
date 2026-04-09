import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/metro.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-admin-users',
  imports: [FormsModule],
  template: `
    <div class="admin-page">
      <div class="card">
        <h1>User Management</h1>
        <p>Manage system users and roles</p>
      </div>

      <div class="card">
        <form (ngSubmit)="onSearch()">
          <div class="filter-row">
            <input type="text" [(ngModel)]="search" name="search" placeholder="Search by name or email..." />
            <select [(ngModel)]="roleFilter" name="roleFilter">
              <option value="">All Roles</option>
              <option value="passenger">passenger</option>
              <option value="staff">staff</option>
              <option value="inspector">inspector</option>
              <option value="admin">admin</option>
            </select>
            <button type="submit">Search</button>
          </div>
        </form>
      </div>

      @if (error()) {
        <div class="alert error">{{ error() }}</div>
      }
      @if (success()) {
        <div class="alert success">{{ success() }}</div>
      }

      <div class="card table-card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @if (loading()) {
              <tr><td colspan="5" class="loading">Loading...</td></tr>
            } @else if (users().length === 0) {
              <tr><td colspan="5" class="empty">No users found</td></tr>
            } @else {
              @for (user of users(); track user.id || user._id) {
                <tr>
                  <td>
                    <div class="user-cell">
                      <div class="avatar">{{ user.name?.charAt(0)?.toUpperCase() }}</div>
                      <span>{{ user.name }}</span>
                    </div>
                  </td>
                  <td>{{ user.email }}</td>
                  <td><span class="badge badge-{{ user.role }}">{{ user.role }}</span></td>
                  <td>
                    <span class="status-badge {{ user.isActive ? 'active' : 'inactive' }}">
                      {{ user.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td>
                    @if (editingUser() === (user.id || user._id)) {
                      <div class="edit-row">
                        <select [(ngModel)]="newRole">
                          <option value="">Select role</option>
                          <option value="passenger">passenger</option>
                          <option value="staff">staff</option>
                          <option value="inspector">inspector</option>
                          <option value="admin">admin</option>
                        </select>
                        <button class="btn-sm btn-primary" (click)="onUpdateRole(user.id || user._id!)" [disabled]="!newRole">Save</button>
                        <button class="btn-sm btn-secondary" (click)="cancelEdit()">Cancel</button>
                      </div>
                    } @else {
                      <button class="btn-sm btn-outline" (click)="startEdit(user)">Edit Role</button>
                    }
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>

        @if (totalPages() > 1) {
          <div class="pagination">
            <span>Page {{ page() }} of {{ totalPages() }}</span>
            <div class="page-buttons">
              <button class="btn-sm btn-secondary" [disabled]="page() === 1" (click)="prevPage()">Previous</button>
              <button class="btn-sm btn-secondary" [disabled]="page() === totalPages()" (click)="nextPage()">Next</button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .admin-page { max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
    .card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .table-card { padding: 0; overflow: hidden; }
    h1 { font-size: 1.8rem; margin: 0 0 8px; color: #1e293b; }
    p { color: #64748b; margin: 0 0 20px; }
    .filter-row { display: flex; gap: 12px; }
    input { flex: 1; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.9rem; }
    input:focus { outline: none; border-color: #3b82f6; }
    select { padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.9rem; background: white; }
    button { padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; white-space: nowrap; }
    button:hover:not(:disabled) { background: #2563eb; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-sm { padding: 6px 12px; font-size: 0.8rem; }
    .btn-outline { background: white; border: 1px solid #d1d5db; color: #374151; }
    .btn-outline:hover { background: #f9fafb; }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-secondary { background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 14px 20px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f9fafb; color: #6b7280; font-weight: 500; text-transform: uppercase; font-size: 0.75rem; }
    .user-cell { display: flex; align-items: center; gap: 10px; }
    .avatar { width: 32px; height: 32px; border-radius: 50%; background: #dbeafe; color: #2563eb; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.8rem; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 500; }
    .badge-passenger { background: #dbeafe; color: #1d4ed8; }
    .badge-staff { background: #dcfce7; color: #15803d; }
    .badge-inspector { background: #ffedd5; color: #c2410c; }
    .badge-admin { background: #fee2e2; color: #dc2626; }
    .status-badge { display: inline-block; padding: 3px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 500; }
    .status-badge.active { background: #dcfce7; color: #15803d; }
    .status-badge.inactive { background: #fee2e2; color: #dc2626; }
    .edit-row { display: flex; gap: 6px; align-items: center; }
    .edit-row select { padding: 4px 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.8rem; }
    .loading, .empty { text-align: center; color: #9ca3af; padding: 24px; }
    .pagination { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-top: 1px solid #e5e7eb; font-size: 0.875rem; color: #6b7280; }
    .page-buttons { display: flex; gap: 8px; }
    .alert { padding: 12px 16px; border-radius: 8px; font-size: 0.9rem; margin-bottom: 0; }
    .alert.error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    .alert.success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
  `],
})
export class AdminUsersComponent implements OnInit {
  private userService = inject(UserService);

  users = signal<User[]>([]);
  loading = signal(false);
  error = signal('');
  success = signal('');
  search = '';
  roleFilter = '';
  page = signal(1);
  totalPages = signal(1);
  editingUser = signal<string | null>(null);
  newRole = '';

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.loading.set(true);
    this.error.set('');
    const params: { page?: number; limit?: number; role?: string; q?: string } = {
      page: this.page(),
      limit: 10,
    };
    if (this.roleFilter) params.role = this.roleFilter;
    if (this.search) params.q = this.search;

    this.userService.getUsers(params).subscribe({
      next: (res) => {
        this.users.set(res.users);
        this.totalPages.set(res.pagination.totalPages);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        const e = err as { message?: string };
        this.error.set(e.message || 'Failed to fetch users');
        this.loading.set(false);
      },
    });
  }

  onSearch() {
    this.page.set(1);
    this.fetchUsers();
  }

  startEdit(user: User) {
    this.editingUser.set(user.id || user._id || null);
    this.newRole = user.role;
  }

  cancelEdit() {
    this.editingUser.set(null);
    this.newRole = '';
  }

  onUpdateRole(userId: string) {
    if (!this.newRole) return;
    this.error.set('');
    this.success.set('');

    this.userService.updateUserRole(userId, this.newRole).subscribe({
      next: () => {
        this.success.set('Role updated successfully');
        this.editingUser.set(null);
        this.newRole = '';
        this.fetchUsers();
      },
      error: (err: unknown) => {
        const e = err as { message?: string };
        this.error.set(e.message || 'Failed to update role');
      },
    });
  }

  prevPage() {
    if (this.page() > 1) {
      this.page.update((p) => p - 1);
      this.fetchUsers();
    }
  }

  nextPage() {
    if (this.page() < this.totalPages()) {
      this.page.update((p) => p + 1);
      this.fetchUsers();
    }
  }
}
