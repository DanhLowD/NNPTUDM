import { describe, it, expect } from 'vitest';
import { User, LoginResponse, ApiResponse, TicketValidationResult, InspectionResult, PaginatedUsers } from './user.model';

describe('User model', () => {
  it('should define valid user', () => {
    const user: User = {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'passenger',
      isActive: true,
    };
    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('john@example.com');
    expect(user.role).toBe('passenger');
  });

  it('should accept all valid roles', () => {
    const roles: User['role'][] = ['passenger', 'staff', 'inspector', 'admin'];
    roles.forEach((role) => {
      const user: User = { name: 'Test', email: 'test@test.com', role };
      expect(user.role).toBe(role);
    });
  });

  it('should define optional fields', () => {
    const user: User = {
      id: 'user-123',
      name: 'John',
      email: 'john@test.com',
      role: 'admin',
      isActive: true,
      monthlyTrips: 50,
      violationCount: 0,
      stationCode: 'ST01',
    };
    expect(user.id).toBe('user-123');
    expect(user.monthlyTrips).toBe(50);
  });
});

describe('LoginResponse', () => {
  it('should contain tokens and user', () => {
    const response: LoginResponse = {
      accessToken: 'token123',
      refreshToken: 'refresh123',
      user: { name: 'John', email: 'john@test.com', role: 'passenger' },
    };
    expect(response.accessToken).toBe('token123');
    expect(response.refreshToken).toBe('refresh123');
    expect(response.user.role).toBe('passenger');
  });
});

describe('ApiResponse', () => {
  it('should have success true', () => {
    const res: ApiResponse<{ id: string }> = {
      success: true,
      message: 'ok',
      data: { id: '1' },
    };
    expect(res.success).toBe(true);
    expect(res.data?.id).toBe('1');
  });

  it('should have success false', () => {
    const res: ApiResponse = { success: false, message: 'error' };
    expect(res.success).toBe(false);
  });
});

describe('TicketValidationResult', () => {
  it('should define valid statuses', () => {
    const statuses: TicketValidationResult['status'][] = ['ALLOW_ENTRY', 'DENY_ENTRY', 'EXPIRED', 'FAILED'];
    statuses.forEach((status) => {
      const result: TicketValidationResult = { status };
      expect(result.status).toBe(status);
    });
  });
});

describe('InspectionResult', () => {
  it('should define valid inspection statuses', () => {
    const statuses: InspectionResult['status'][] = ['PENDING_SUPERVISOR_REVIEW', 'APPROVED', 'REJECTED'];
    statuses.forEach((status) => {
      const result: InspectionResult = { status };
      expect(result.status).toBe(status);
    });
  });
});

describe('PaginatedUsers', () => {
  it('should define pagination metadata', () => {
    const paginated: PaginatedUsers = {
      users: [{ name: 'A', email: 'a@test.com', role: 'passenger' }],
      pagination: { page: 1, limit: 10, total: 100, totalPages: 10 },
    };
    expect(paginated.users.length).toBe(1);
    expect(paginated.pagination.totalPages).toBe(10);
  });
});
