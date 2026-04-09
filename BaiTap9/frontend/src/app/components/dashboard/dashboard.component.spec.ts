import { describe, it, expect } from 'vitest';
import { User } from '../../models/user.model';

describe('Dashboard Logic', () => {
  describe('role descriptions', () => {
    const descriptions: Record<string, string> = {
      passenger: 'Hanh khach - Su dung he thong metro',
      staff: 'Nhan vien - Quan ly ve tai cong vao',
      inspector: 'Kiem soat vien - Kiem tra ve thu cong',
      admin: 'Quan tri vien - Quan ly he thong',
    };

    it('should return correct description for each role', () => {
      expect(descriptions['passenger']).toBe('Hanh khach - Su dung he thong metro');
      expect(descriptions['staff']).toBe('Nhan vien - Quan ly ve tai cong vao');
      expect(descriptions['inspector']).toBe('Kiem soat vien - Kiem tra ve thu cong');
      expect(descriptions['admin']).toBe('Quan tri vien - Quan ly he thong');
    });

    it('should return undefined for unknown role', () => {
      expect(descriptions['unknown']).toBeUndefined();
    });
  });

  describe('role features', () => {
    const features: Record<string, string[]> = {
      passenger: ['Xem thong tin tai khoan', 'Mua ve metro', 'Lich su giao dich'],
      staff: ['Kiem tra ve tai cong vao', 'Xac nhan hop le ve', 'Bao cao su co'],
      inspector: ['Kiem tra thu cong', 'Lap bien ban vi pham', 'Xem lich su kiem tra'],
      admin: ['Quan ly nguoi dung', 'Quan ly ve', 'Xem bao cao thong ke', 'Cau hinh he thong'],
    };

    it('should return features for each role', () => {
      expect(features['passenger'].length).toBe(3);
      expect(features['staff'].length).toBe(3);
      expect(features['inspector'].length).toBe(3);
      expect(features['admin'].length).toBe(4);
    });

    it('should contain specific features', () => {
      expect(features['admin']).toContain('Quan ly nguoi dung');
      expect(features['staff']).toContain('Kiem tra ve tai cong vao');
    });
  });

  describe('hasRole check', () => {
    const hasRole = (user: User | null, ...roles: string[]) => {
      return user ? roles.includes(user.role) : false;
    };

    it('should return false for null user', () => {
      expect(hasRole(null, 'admin')).toBe(false);
    });

    it('should check single role', () => {
      const user: User = { name: 'Admin', email: 'a@test.com', role: 'admin' };
      expect(hasRole(user, 'admin')).toBe(true);
      expect(hasRole(user, 'staff')).toBe(false);
    });

    it('should check multiple roles', () => {
      const admin: User = { name: 'A', email: 'a@test.com', role: 'admin' };
      const staff: User = { name: 'S', email: 's@test.com', role: 'staff' };

      expect(hasRole(admin, 'admin', 'staff')).toBe(true);
      expect(hasRole(staff, 'admin', 'staff')).toBe(true);
    });
  });

  describe('avatar initial', () => {
    const getInitial = (name: string | undefined) => name?.charAt(0)?.toUpperCase() ?? '';

    it('should extract first character uppercase', () => {
      expect(getInitial('John Doe')).toBe('J');
      expect(getInitial('Alice')).toBe('A');
    });

    it('should handle empty string', () => {
      expect(getInitial('')).toBe('');
    });

    it('should handle undefined', () => {
      expect(getInitial(undefined)).toBe('');
    });
  });
});
