# BaiTap9 — Angular Modern Features & Metro Ticket Management

Frontend Angular (Standalone, Signals, New Control Flow) kết nối backend Node.js Express.

## Angular Overview

Tài liệu tổng quan Angular cơ bản: [`ANGULAR_OVERVIEW.md`](./ANGULAR_OVERVIEW.md)

## Quick Start

```bash
# Backend
cd BaiTap9/backend
npm install
cp .env.example .env
npm run dev

# Frontend
cd BaiTap9/frontend
npm install
npm run start
```

## Architecture

```
BaiTap9/
├── backend/          # Node.js + Express API (JWT + Refresh Token)
│   └── src/
│       ├── controllers/
│       ├── routes/
│       ├── models/
│       ├── services/
│       ├── middlewares/  (auth, role, rateLimit, idempotency)
│       ├── realtime/     (Socket.io)
│       └── workers/      (report worker)
└── frontend/         # Angular 19 (Standalone + Signals)
    └── src/app/
        ├── components/
        │   ├── login/
        │   ├── register/
        │   ├── dashboard/
        │   ├── ticket-validation/
        │   ├── manual-inspection/
        │   ├── admin-users/
        │   └── layout/
        ├── services/
        │   ├── api.service.ts    (HTTP + auto refresh token)
        │   ├── auth.service.ts   (login/logout/role)
        │   └── metro.service.ts  (ticket ops + user mgmt)
        └── models/
            └── user.model.ts
```

## Roles

| Role        | Mô tả              | Quyền                   |
| ----------- | ------------------ | ----------------------- |
| `passenger` | Hành khách         | Xem thông tin tài khoản |
| `staff`     | Nhân viên cổng vào | Validate ticket         |
| `inspector` | Kiểm soát viên     | Manual inspection       |
| `admin`     | Quản trị viên      | Full access             |

---

## PHẦN HƯỚNG DẪN

---

### Bài 0: Chuẩn bị môi trường

#### 0.1. Cài đặt backend

```bash
cd BaiTap9/backend
npm install
cp .env.example .env
```

Kiểm tra `.env`:

```
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/metroticket_v2
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
NODE_ENV=development
```

#### 0.2. Khởi động backend

```bash
npm run dev
```

Kết quả mong đợi:

```
Server running at http://localhost:3000
```

#### 0.3. Cài đặt frontend

```bash
cd BaiTap9/frontend
npm install
npm run start
```

Kết quả mong đợi: Ứng dụng Angular chạy tại `http://localhost:4200`.

---

### Bài 1: Angular Standalone Components

#### 1.1. Khái niệm

Angular 14+ giới thiệu **Standalone Components** — không cần khai báo trong `@NgModule`. Mỗi component tự khai báo imports của nó.

#### 1.2. So sánh Module-based vs Standalone

**Module-based (cũ):**

```typescript
// app.module.ts
@NgModule({
  declarations: [LoginComponent, DashboardComponent],
  imports: [FormsModule, HttpClientModule, RouterModule],
})
export class AppModule {}

// login.component.ts
@Component({ selector: 'app-login' })
export class LoginComponent { /* ... */ }
```

**Standalone (mới - dùng trong BaiTap9):**

```typescript
// login.component.ts
@Component({
  selector: 'app-login',
  standalone: true,                          // ← Không cần module
  imports: [FormsModule],                     // ← Khai báo riêng
  template: `...`,
  styles: [`...`],
})
export class LoginComponent { /* ... */ }
```

#### 1.3. So sánh cú pháp

| Module-based                   | Standalone                      |
| ------------------------------ | ------------------------------- |
| `@NgModule` để khai báo        | `standalone: true`              |
| Import chung trong `AppModule` | Import riêng trong `@Component` |
| Mọi component cùng tree        | Mỗi component độc lập           |

#### 1.4. Bootstrap Standalone

File [app.ts](frontend/src/app/app.ts):

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app.config';
import { App } from './app.ts';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
```

#### 1.5. App Config (Providers)

File [app.config.ts](frontend/src/app/app.config.ts):

```typescript
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
  ],
};
```

**Giải thích:**

- `provideRouter(routes)` — cung cấp routing service với lazy loading
- `provideHttpClient()` — cung cấp `HttpClient` cho tất cả components
- `provideBrowserGlobalErrorListeners()` — bắt global JS errors

---

### Bài 2: Signals — Reactive State

#### 2.1. Khái niệm Signals

Angular 16+ giới thiệu **Signals** — primitive reactive value. Khi signal thay đổi, Angular tự động schedule re-render cho components/phân tử phụ thuộc.

#### 2.2. Tạo Signals

```typescript
import { signal } from '@angular/core';

const count = signal(0);           // writable signal
const user = signal<User | null>(null);
const loading = signal(false);
const error = signal('');
```

#### 2.3. Đọc và ghi

```typescript
// Đọc (get)
console.log(count());              // → 0
console.log(user()?.name);         // → "Toan"

// Ghi (set/update)
count.set(5);                      // → gán giá trị mới
count.update(n => n + 1);          // → tăng lên 1
count.update(n => n * 2);          // → nhân đôi

user.set(null);                     // → clear user
error.set('Something went wrong'); // → set error message
```

#### 2.4. Computed Signals

```typescript
import { computed } from '@angular/core';

const firstName = signal('Bui');
const lastName = signal('Manh Toan');

const fullName = computed(() => `${firstName()} ${lastName()}`);
console.log(fullName()); // → "Bui Manh Toan"
```

#### 2.5. Signals trong Component (BaiTap9)

Trong [login.component.ts](frontend/src/app/components/login/login.component.ts):

```typescript
export class LoginComponent {
  loading = signal(false);   // Signal cho trạng thái loading
  error = signal('');        // Signal cho thông báo lỗi

  onSubmit() {
    this.error.set('');      // Clear error trước
    this.loading.set(true);   // Bật loading

    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        const e = err as { message?: string };
        this.error.set(e.message || 'Login failed');
        this.loading.set(false);
      },
    });
  }
}
```

#### 2.6. Effect trong Signals

```typescript
import { effect, signal } from '@angular/core';

const theme = signal<'light' | 'dark'>('light');

effect(() => {
  console.log('Theme changed to:', theme());
  document.body.className = theme();
});
```

#### 2.7. So sánh Signal vs Subject (RxJS)

| Tiêu chí           | Signal                       | BehaviorSubject            |
| ------------------ | ---------------------------- | -------------------------- |
| API                | `.set()`, `.update()`, `.()` | `.next()`, `.value`        |
| Type-safe          | Có                           | Có                         |
| Automatic tracking | Trong template + effect      | Cần `subscribe`            |
| Memory leak        | Không                        | Có (nếu không unsubscribe) |
| Batch updates      | Có                           | Không                      |
| Performance        | Tối ưu hơn (fine-grained)    | Coarse-grained             |

---

### Bài 3: New Control Flow (`@if`, `@for`, `@switch`)

#### 3.1. Angular 17+ Control Flow Syntax

Angular 17 giới thiệu built-in control flow — không cần directive `*ngIf`, `*ngFor` nữa.

#### 3.2. `@if` — Thay thế `*ngIf`

**Cũ:**

```html
<div *ngIf="user">
  Welcome, {{ user.name }}
</div>
```

**Mới:**

```html
@if (user()) {
  <div>Welcome, {{ user()!.name }}</div>
}
```

**@if với else:**

```html
@if (loading()) {
  <div>Loading...</div>
} @else if (error()) {
  <div class="alert">{{ error() }}</div>
} @else {
  <div>Content here</div>
}
```

Trong [login.component.ts](frontend/src/app/components/login/login.component.ts):

```html
@if (error()) {
  <div class="alert error">{{ error() }}</div>
}
```

#### 3.3. `@for` — Thay thế `*ngFor`

**Cũ:**

```html
<li *ngFor="let item of items">{{ item.name }}</li>
```

**Mới:**

```html
@for (item of items; track item.id) {
  <li>{{ item.name }}</li>
}
```

> **Quan trọng:** `track item.id` bắt buộc cho performance. Angular dùng key-based diffing thay vì index-based.

Trong [dashboard.component.ts](frontend/src/app/components/dashboard/dashboard.component.ts):

```html
@for (feature of features(); track feature) {
  <div class="feature-item">
    <span class="dot"></span>
    {{ feature }}
  </div>
}
```

Trong [ticket-validation.component.ts](frontend/src/app/components/ticket-validation/ticket-validation.component.ts):

```html
@for (item of history(); track item.timestamp) {
  <tr>
    <td class="mono">{{ item.code }}</td>
    <td>{{ item.timestamp }}</td>
  </tr>
}
```

#### 3.4. `@switch` — Thay thế `*ngSwitch`

**Cũ:**

```html
<div [ngSwitch]="status">
  <div *ngSwitchCase="'active'">Active</div>
  <div *ngSwitchCase="'inactive'">Inactive</div>
  <div *ngSwitchDefault>Unknown</div>
</div>
```

**Mới:**

```html
@switch (status) {
  @case ('active') { <div>Active</div> }
  @case ('inactive') { <div>Inactive</div> }
  @default { <div>Unknown</div> }
}
```

Trong [ticket-validation.component.ts](frontend/src/app/components/ticket-validation/ticket-validation.component.ts):

```html
@if (result()) {
  <div class="result-box status-{{ result()!.status }}">
    <div class="result-icon">
      @if (result()!.status === 'ALLOW_ENTRY') { OK }
      @else if (result()!.status === 'DENY_ENTRY') { X }
      @else if (result()!.status === 'EXPIRED') { E }
      @else { F }
    </div>
  </div>
}
```

---

### Bài 4: Routing — Lazy Loading & Guards

#### 4.1. Route Definitions

File [app.routes.ts](frontend/src/app/app.routes.ts):

```typescript
import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: '',
    loadComponent: () => import('./components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'ticket-validation', loadComponent: () => import('./components/ticket-validation/ticket-validation.component').then(m => m.TicketValidationComponent) },
      { path: 'manual-inspection', loadComponent: () => import('./components/manual-inspection/manual-inspection.component').then(m => m.ManualInspectionComponent) },
      { path: 'admin/users', loadComponent: () => import('./components/admin-users/admin-users.component').then(m => m.AdminUsersComponent) },
    ],
  },
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent), canActivate: [guestGuard] },
  { path: 'register', loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent), canActivate: [guestGuard] },
  { path: '**', redirectTo: 'dashboard' },
];
```

#### 4.2. Lazy Loading — `loadComponent`

```typescript
// Thay vì import static:
// import { DashboardComponent } from './components/dashboard/dashboard.component';

// Dùng lazy loading:
loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
```

**Lợi ích:**

- Mỗi route là một separate chunk JS
- Chỉ tải khi người dùng vào route đó
- Giảm bundle size ban đầu

**Sơ đồ:**

```
Initial bundle: app.ts + app.routes.ts + auth.service.ts + api.service.ts
                                       ↓
              User navigates to /dashboard
                                       ↓
              Chunk loaded: dashboard.component.js
                                       ↓
              User navigates to /admin/users
                                       ↓
              Chunk loaded: admin-users.component.js
```

#### 4.3. Route Guards — `canActivate`

```typescript
const authGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) {
    return true;
  }
  return router.createUrlTree(['/login']);
};

const guestGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) {
    return true;
  }
  return router.createUrlTree(['/dashboard']);
};
```

**authGuard:** Chặn user chưa login vào protected routes → redirect `/login`.

**guestGuard:** Chặn user đã login vào `/login` hoặc `/register` → redirect `/dashboard`.

#### 4.4. Nested Routes

Layout component chứa `<router-outlet />` để render các child routes:

```typescript
{
  path: '',
  loadComponent: () => import('./components/layout/layout.component').then(m => m.LayoutComponent),
  canActivate: [authGuard],
  children: [
    { path: 'dashboard', ... },
    { path: 'ticket-validation', ... },
  ],
}
```

Trong [layout.component.ts](frontend/src/app/components/layout/layout.component.ts):

```html
<div class="layout">
  <nav class="sidebar">
    <!-- Sidebar navigation -->
  </nav>
  <main class="content">
    <router-outlet />   <!-- Child routes render ở đây -->
  </main>
</div>
```

#### 4.5. Conditional Navigation Links

Dựa trên role của user, hiển thị menu items khác nhau:

```html
@if (hasRole('staff', 'admin')) {
  <li><a routerLink="/ticket-validation">Validate Ticket</a></li>
}
@if (hasRole('inspector', 'admin')) {
  <li><a routerLink="/manual-inspection">Manual Inspection</a></li>
}
@if (hasRole('admin')) {
  <li><a routerLink="/admin/users">Admin Users</a></li>
}
```

---

### Bài 5: Services & Dependency Injection

#### 5.1. Injectable Service

```typescript
import { Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })  // Singleton toàn app
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);
  // ...
}
```

#### 5.2. Functional Injection (`inject()`)

Angular 14+ cho phép dùng `inject()` trong constructor body — thay thế constructor injection:

```typescript
// Cũ (constructor injection):
export class LoginComponent {
  private auth: AuthService;
  constructor(auth: AuthService, router: Router) {
    this.auth = auth;
    this.router = router;
  }
}

// Mới (inject()):
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
}
```

Ưu điểm:

- Ngắn gọn hơn
- Dễ đọc dependency graph
- Hỗ trợ lazy injection

#### 5.3. AuthService — User State

File [auth.service.ts](frontend/src/app/services/auth.service.ts):

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

  // BehaviorSubject pattern cho Observable user stream
  private userSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  user$ = this.userSubject.asObservable();

  login(email: string, password: string): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/auth/login', { email, password }).pipe(
      tap((res) => {
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('refreshToken', res.refreshToken);
        this.setStoredUser(res.user);
        this.userSubject.next(res.user);
      })
    );
  }

  logout(): void {
    this.doLogout();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  hasRole(...roles: string[]): boolean {
    const user = this.getUser();
    return user ? roles.includes(user.role) : false;
  }
}
```

#### 5.4. ApiService — HTTP + Auto Refresh Token

File [api.service.ts](frontend/src/app/services/api.service.ts):

```typescript
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  private getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  private refreshTokens(): Observable<{ accessToken: string; refreshToken: string }> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post<{ accessToken: string; refreshToken: string }>(
      `${API_URL}/auth/refresh-token`,
      { refreshToken }
    );
  }

  private handleError(error: unknown): Observable<never> {
    const err = error as { status?: number; message?: string };
    if (err.status === 401) {
      return this.refreshTokens().pipe(
        tap((tokens) => this.setTokens(tokens.accessToken, tokens.refreshToken)),
        catchError(() => {
          this.clearTokens();
          window.location.href = '/login';
          return throwError(() => new Error('Session expired'));
        })
      ) as unknown as Observable<never>;
    }
    return throwError(() => error);
  }
}
```

**Flow:**

```
Request fails with 401
         ↓
Refresh token gửi lên /auth/refresh-token
         ↓
Nhận accessToken + refreshToken mới
         ↓
Lưu vào localStorage
         ↓
Retry request gốc với token mới
         ↓
Nếu refresh cũng fail → logout → redirect /login
```

---

### Bài 6: Role-Based UI

#### 6.1. Role Badge Component

Trong [dashboard.component.ts](frontend/src/app/components/dashboard/dashboard.component.ts):

```html
<span class="role-badge role-{{ user()?.role }}">
  {{ user()?.role?.toUpperCase() }}
</span>
```

CSS:

```css
.role-passenger { background: #dbeafe; color: #1d4ed8; }
.role-staff { background: #dcfce7; color: #15803d; }
.role-inspector { background: #ffedd5; color: #c2410c; }
.role-admin { background: #fee2e2; color: #dc2626; }
```

#### 6.2. Role-Based Feature Display

```html
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
  <a href="/ticket-validation" class="btn btn-green">Validate Ticket</a>
}

@if (hasRole('inspector')) {
  <a href="/manual-inspection" class="btn btn-orange">Manual Inspection</a>
}
```

#### 6.3. Role-Based API Calls

Trong [admin-users.component.ts](frontend/src/app/components/admin-users/admin-users.component.ts):

```typescript
onUpdateRole(userId: string) {
  if (!this.newRole) return;
  this.userService.updateUserRole(userId, this.newRole).subscribe({
    next: () => {
      this.success.set('Role updated successfully');
      this.fetchUsers();
    },
    error: (err) => {
      this.error.set(e.message || 'Failed to update role');
    },
  });
}
```

---

### Bài 7: Inline Template & Styles

#### 7.1. Inline Template

Thay vì tách file `.html`, template được viết trực tiếp trong `@Component`:

```typescript
@Component({
  selector: 'app-login',
  imports: [FormsModule],
  template: `
    <div class="login-page">
      <h1>Metro Ticket Management</h1>
      <form (ngSubmit)="onSubmit()">
        <!-- ... -->
      </form>
    </div>
  `,
})
```

#### 7.2. Inline Styles

```typescript
@Component({
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .login-card {
      background: white;
      padding: 40px;
      border-radius: 12px;
    }
  `],
})
```

**Ưu điểm:**

- Component hoàn chỉnh trong 1 file `.ts`
- Styles scoped tự động (không cần encapsulation)
- Dễ copy-paste component

#### 7.3. Layout Component với Sidebar

Trong [layout.component.ts](frontend/src/app/components/layout/layout.component.ts):

```html
<div class="layout">
  <nav class="sidebar">
    <div class="logo">
      <h2>Metro System</h2>
      <p>BaiTap9</p>
    </div>
    <ul class="nav-menu">
      <li><a routerLink="/dashboard" routerLinkActive="active">Dashboard</a></li>
      <!-- Conditional menu items based on role -->
    </ul>
    <div class="user-info">
      <div class="user-avatar">{{ user()!.name?.charAt(0) }}</div>
      <span class="user-name">{{ user()!.name }}</span>
      <button (click)="logout()">Logout</button>
    </div>
  </nav>
  <main class="content">
    <router-outlet />
  </main>
</div>
```

---

## Cấu trúc file BaiTap9

### Frontend Structure

```
frontend/src/app/
├── app.ts                    # Root component (RouterOutlet)
├── app.config.ts             # Providers (Router, HttpClient)
├── app.routes.ts              # Route definitions + guards
├── models/
│   └── user.model.ts          # Interfaces (User, LoginResponse, etc.)
├── services/
│   ├── api.service.ts          # HTTP wrapper + auto refresh
│   ├── auth.service.ts         # Auth state + login/logout/role
│   └── metro.service.ts       # Ticket + User API calls
└── components/
    ├── layout/                # LayoutComponent (sidebar + router-outlet)
    ├── login/                 # LoginComponent
    ├── register/              # RegisterComponent
    ├── dashboard/             # DashboardComponent (role info)
    ├── ticket-validation/     # TicketValidationComponent
    ├── manual-inspection/     # ManualInspectionComponent
    └── admin-users/          # AdminUsersComponent (CRUD users)
```

### Backend Structure

```
backend/src/
├── app.js                    # Express app setup
├── server.js                  # HTTP server + Socket.io init
├── config/
│   └── db.js                  # MongoDB connection
├── models/
│   ├── user.model.js
│   ├── metroEvent.model.js
│   ├── refreshToken.model.js
│   ├── report.model.js
│   └── idempotency.model.js
├── controllers/
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── metro.controller.js
│   └── report.controller.js
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── metro.routes.js
│   └── report.routes.js
├── services/
│   ├── token.service.js
│   └── report.service.js
├── middlewares/
│   ├── auth.middleware.js     # JWT verification
│   ├── role.middleware.js     # Role-based access
│   ├── rateLimit.middleware.js
│   ├── idempotency.middleware.js
│   ├── validate.middleware.js
│   └── error.middleware.js
├── realtime/
│   └── socket.js              # Socket.io for real-time events
├── workers/
│   └── report.worker.js        # Background report processing
├── events/
│   └── domainEvents.js
├── validators/
│   ├── auth.validator.js
│   ├── metro.validator.js
│   ├── user.validator.js
│   └── report.validator.js
└── utils/
    ├── apiResponse.js
    └── appError.js
```

---

## API Endpoints

### Auth

```bash
# Đăng ký
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Toan","email":"toan@test.com","password":"123456"}'

# Đăng nhập
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"toan@test.com","password":"123456"}'

# Refresh token
curl -X POST http://localhost:3000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refresh_token>"}'

# Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refresh_token>"}'
```

### Metro (Ticket)

```bash
# Validate ticket (staff/admin)
curl -X POST http://localhost:3000/api/metro/tickets/TKT001/validate-entry \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"stationCode":"ST01"}'

# Manual inspection (inspector/admin)
curl -X POST http://localhost:3000/api/metro/tickets/TKT001/manual-inspection \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"reason":"Suspected tampering"}'
```

### Users (Admin)

```bash
# Get users (admin)
curl "http://localhost:3000/api/users?page=1&limit=10&role=staff" \
  -H "Authorization: Bearer <token>"

# Update user role (admin)
curl -X PATCH http://localhost:3000/api/users/<userId>/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"role":"inspector"}'
```

---

## Câu hỏi lý thuyết

Viết câu trả lời vào thư mục `answers/`:

**Bài 1 — Standalone Components:**

1. Ưu điểm của Standalone Components so với Module-based?
2. `bootstrapApplication` vs `platformBrowserDynamic().bootstrapModule` khác nhau thế nào?
3. `providedIn: 'root'` vs provided trong `appConfig.providers` khi nào dùng cái nào?

**Bài 2 — Signals:**

1. So sánh Signal với RxJS BehaviorSubject — khi nào dùng cái nào?
2. `signal.set()` vs `signal.update()` khác nhau thế nào?
3. Computed signal khác gì regular signal?
4. Tại sao signal giúp Angular rendering hiệu quả hơn so với Zone.js change detection?
5. Signals có replace hoàn toàn RxJS không? Khi nào nên dùng RxJS?

**Bài 3 — New Control Flow:**

1. `@for` với `track` bắt buộc — tại sao?
2. So sánh index-based diffing (`*ngFor`) vs key-based tracking (`@for`).
3. `@if` vs `*ngIf` khác nhau gì về performance?

**Bài 4 — Routing:**

1. Lazy loading (`loadComponent`) hoạt động thế nào? Nó ảnh hưởng gì đến bundle size?
2. `canActivate` guard vs functional guard — ưu nhược điểm?
3. Nested routes (`children`) vs sibling routes khác nhau thế nào?
4. `routerLinkActive` hoạt động ra sao?

**Bài 5 — Services:**

1. Singleton service (`providedIn: 'root'`) hoạt động thế nào trong Angular DI?
2. Flow auto refresh token: mô tả từng bước khi access token hết hạn.
3. `inject()` function vs constructor injection — ưu điểm của `inject()`?
4. Tại sao cần cả access token lẫn refresh token? Dùng 1 token thôi có được không?

**Bài 6 — Role-Based UI:**

1. Role-based access control (RBAC) trong frontend chỉ là "cosmetic" — giải thích.
2. So sánh hide-by-role (CSS) vs block-by-role (guard) vs server-enforced (middleware).

**Bài 7 — Inline Template:**

1. Ưu nhược điểm của inline template/styles so với tách file riêng?
2. Khi nào nên dùng inline, khi nào nên tách file?

---

## Kiểm tra kết quả

### Checklist

- [ ] Backend chạy tại `http://localhost:3000`
- [ ] Frontend chạy tại `http://localhost:4200`
- [ ] Đăng ký tài khoản mới thành công
- [ ] Đăng nhập → redirect `/dashboard`
- [ ] Dashboard hiển thị đúng role
- [ ] Staff login thấy menu "Validate Ticket"
- [ ] Inspector login thấy menu "Manual Inspection"
- [ ] Admin login thấy đủ cả 3 menu + "Admin Users"
- [ ] Validate ticket gọi API thành công
- [ ] Manual inspection tạo inspection record
- [ ] Admin users page load được danh sách users
- [ ] Admin đổi role của user khác thành công
- [ ] Logout redirect về `/login`
- [ ] Chưa login truy cập `/dashboard` → redirect `/login`
- [ ] Đã login truy cập `/login` → redirect `/dashboard`

---

## Lỗi thường gặp

### Lỗi 1: `NullInjectorError: No provider for HttpClient`

**Nguyên nhân:** Quên import `provideHttpClient()` trong `appConfig`.

```typescript
// Sửa trong app.config.ts:
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),  // ← Thêm dòng này
    provideRouter(routes),
  ],
};
```

### Lỗi 2: Signal `.set()` không trigger re-render

**Nguyên nhân:** Đọc signal trong method nhưng không dùng `signal()` trong template.

### Lỗi 3: Access token undefined khi gọi API

**Nguyên nhân:** Gọi API trước khi login hoàn tất (async race condition).

### Lỗi 4: `Cannot read properties of null`

**Nguyên nhân:** Dùng `user().name` khi `user()` là `null`. Dùng optional chaining: `user()?.name` hoặc `@if (user())`.

---

## Tài liệu tham khảo

- Angular Signals: https://angular.dev/guide/signals
- Angular New Control Flow: https://angular.dev/guide/templates/control-flow
- Standalone Components: https://angular.dev/guide/components
- Lazy Loading: https://angular.dev/guide/lazy-loading-ngmodules
- Angular 19 New Features: https://blog.angular.dev/angular-v19-海里
- Functional Route Guards: https://angular.dev/guide/routing/common-router-tasks#preventing-unauthorized-access
- Angular DI: https://angular.dev/guide/di
