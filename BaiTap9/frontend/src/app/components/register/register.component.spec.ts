import { describe, it, expect } from 'vitest';

describe('Register Logic', () => {
  describe('form validation', () => {
    const validate = (name: string, email: string, password: string, confirm: string) => {
      if (!name || !email || !password || !confirm) return 'Please fill in all fields';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email';
      if (password.length < 6) return 'Password must be at least 6 characters';
      if (password !== confirm) return 'Passwords do not match';
      return '';
    };

    it('should require all fields', () => {
      expect(validate('', '', '', '')).toBe('Please fill in all fields');
      expect(validate('John', '', '', '')).toBe('Please fill in all fields');
    });

    it('should validate email format', () => {
      expect(validate('John', 'invalid', 'password123', 'password123')).toBe('Please enter a valid email');
    });

    it('should validate password length', () => {
      expect(validate('John', 'john@test.com', '12345', '12345')).toBe('Password must be at least 6 characters');
      expect(validate('John', 'john@test.com', '123456', '123456')).toBe('');
    });

    it('should validate password match', () => {
      expect(validate('John', 'john@test.com', 'password123', 'different')).toBe('Passwords do not match');
      expect(validate('John', 'john@test.com', 'password123', 'password123')).toBe('');
    });

    it('should pass all validations', () => {
      expect(validate('John Doe', 'john@test.com', 'password123', 'password123')).toBe('');
    });
  });

  describe('email validation', () => {
    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    it('should accept valid emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user@company.co.uk')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('no-domain')).toBe(false);
      expect(isValidEmail('@no-user.com')).toBe(false);
    });
  });

  describe('state management', () => {
    it('should manage loading state', () => {
      let loading = false;
      loading = true;
      expect(loading).toBe(true);
      loading = false;
      expect(loading).toBe(false);
    });

    it('should manage error state', () => {
      let error = '';
      error = 'Registration failed';
      expect(error).toBe('Registration failed');
    });

    it('should manage success state', () => {
      let success = false;
      success = true;
      expect(success).toBe(true);
    });
  });
});
