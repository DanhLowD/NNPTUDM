import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpInterceptorFn } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { tap } from 'rxjs/operators';

const API_URL = 'http://localhost:3000/api';

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

  private clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  private refreshTokens(): Observable<{ accessToken: string; refreshToken: string }> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token'));
    }
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

  private request<T>(method: string, url: string, body?: unknown): Observable<T> {
    const token = this.getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options: Record<string, unknown> = { headers };
    if (body) (options as Record<string, unknown>)['body'] = body;

    return (this.http as unknown as {
      [key: string]: (url: string, options?: Record<string, unknown>) => Observable<T>
    })[method.toLowerCase()](url, options).pipe(
      catchError((error) => this.handleError(error))
    ) as Observable<T>;
  }

  get<T>(url: string): Observable<T> {
    return this.request<T>('GET', url);
  }

  post<T>(url: string, body?: unknown): Observable<T> {
    return this.request<T>('POST', url, body);
  }

  patch<T>(url: string, body?: unknown): Observable<T> {
    return this.request<T>('PATCH', url, body);
  }

  delete<T>(url: string): Observable<T> {
    return this.request<T>('DELETE', url);
  }
}
