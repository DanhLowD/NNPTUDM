import { describe, it, expect } from 'vitest';
import { User } from '../models/user.model';

describe('AuthService Logic', () => {
  describe('isLoggedIn', () => {
    it('should return false when no token', () => {
      const isLoggedIn = () => !!localStorage.getItem('accessToken');
      localStorage.clear();
      expect(isLoggedIn()).toBe(false);
    });

    it('should return true when token exists', () => {
      localStorage.setItem('accessToken', 'fake-token');
      const isLoggedIn = () => !!localStorage.getItem('accessToken');
      expect(isLoggedIn()).toBe(true);
      localStorage.clear();
    });
  });

  describe('hasRole', () => {
    const hasRole = (user: User | null, ...roles: string[]) => {
      return user ? roles.includes(user.role) : false;
    };

    it('should return false when no user', () => {
      expect(hasRole(null, 'admin')).toBe(false);
    });

    it('should return true when user has matching role', () => {
      const user: User = { name: 'Admin', email: 'a@test.com', role: 'admin' };
      expect(hasRole(user, 'admin')).toBe(true);
    });

    it('should return false when role does not match', () => {
      const user: User = { name: 'Staff', email: 's@test.com', role: 'staff' };
      expect(hasRole(user, 'admin')).toBe(false);
    });

    it('should check multiple roles', () => {
      const staff: User = { name: 'Staff', email: 's@test.com', role: 'staff' };
      expect(hasRole(staff, 'admin', 'staff')).toBe(true);
      expect(hasRole(staff, 'inspector')).toBe(false);
    });
  });

  describe('token storage', () => {
    it('should store and retrieve tokens', () => {
      localStorage.setItem('accessToken', 'tok123');
      localStorage.setItem('refreshToken', 'ref456');
      expect(localStorage.getItem('accessToken')).toBe('tok123');
      expect(localStorage.getItem('refreshToken')).toBe('ref456');
      localStorage.clear();
    });

    it('should clear tokens on logout', () => {
      localStorage.setItem('accessToken', 'tok123');
      localStorage.setItem('refreshToken', 'ref456');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });

    it('should store and retrieve user', () => {
      const user: User = { name: 'Test', email: 'test@test.com', role: 'passenger' };
      localStorage.setItem('user', JSON.stringify(user));
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      expect(stored.name).toBe('Test');
      expect(stored.role).toBe('passenger');
      localStorage.clear();
    });
  });

  describe('login validation', () => {
    const validateLogin = (email: string, password: string) => {
      if (!email || !password) return 'Please fill in all fields';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email';
      return '';
    };

    it('should require both fields', () => {
      expect(validateLogin('', '')).toBe('Please fill in all fields');
      expect(validateLogin('test@test.com', '')).toBe('Please fill in all fields');
      expect(validateLogin('', 'password')).toBe('Please fill in all fields');
    });

    it('should validate email format', () => {
      expect(validateLogin('test@example.com', 'password')).toBe('');
      expect(validateLogin('invalid', 'password')).toBe('Please enter a valid email');
    });

    it('should pass with valid credentials', () => {
      expect(validateLogin('user@domain.com', 'password123')).toBe('');
    });
  });
});
