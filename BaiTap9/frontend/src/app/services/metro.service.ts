import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  TicketValidationResult,
  InspectionResult,
  PaginatedUsers,
  User,
} from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class MetroService {
  private api = inject(ApiService);

  validateTicket(ticketCode: string, stationCode: string): Observable<TicketValidationResult> {
    return this.api.post<TicketValidationResult>(
      `/metro/tickets/${ticketCode}/validate-entry`,
      { stationCode }
    );
  }

  manualInspection(ticketCode: string, reason: string): Observable<InspectionResult> {
    return this.api.post<InspectionResult>(
      `/metro/tickets/${ticketCode}/manual-inspection`,
      { reason }
    );
  }

  getTicketInfo(ticketCode: string): Observable<TicketValidationResult> {
    return this.api.get<TicketValidationResult>(`/metro/tickets/${ticketCode}`);
  }
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private api = inject(ApiService);

  getUsers(params: { page?: number; limit?: number; role?: string; q?: string } = {}): Observable<PaginatedUsers> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.role) searchParams.set('role', params.role);
    if (params.q) searchParams.set('q', params.q);

    const query = searchParams.toString();
    return this.api.get<PaginatedUsers>(`/users${query ? `?${query}` : ''}`);
  }

  updateUserRole(userId: string, role: string): Observable<{ user: User }> {
    return this.api.patch<{ user: User }>(`/users/${userId}/role`, { role });
  }

  getUserById(userId: string): Observable<{ user: User }> {
    return this.api.get<{ user: User }>(`/users/${userId}`);
  }
}
