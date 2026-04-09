export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: 'passenger' | 'staff' | 'inspector' | 'admin';
  isActive?: boolean;
  monthlyTrips?: number;
  violationCount?: number;
  stationCode?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface TicketValidationResult {
  status: 'ALLOW_ENTRY' | 'DENY_ENTRY' | 'EXPIRED' | 'FAILED';
  message?: string;
  ticketCode?: string;
  stationCode?: string;
}

export interface InspectionResult {
  status: 'PENDING_SUPERVISOR_REVIEW' | 'APPROVED' | 'REJECTED';
  inspectionId?: string;
  ticketCode?: string;
  reason?: string;
}

export interface PaginatedUsers {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
