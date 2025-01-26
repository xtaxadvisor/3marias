import { z } from 'zod';

const passwordSchema = z.string()
  .min(12, 'Password must be at least 12 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
  .refine(
    (password) => {
      // Additional check for commonly used passwords
      const commonPasswords = ['password123', 'admin123', 'qwerty123', 'Travelhere2024$'];
      return !commonPasswords.includes(password.toLowerCase());
    },
    { message: 'Password is too common. Please choose a more secure password.' }
  );

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const result = passwordSchema.safeParse(password);
  
  if (!result.success) {
    return {
      isValid: false,
      errors: result.error.errors.map(err => err.message)
    };
  }

  return {
    isValid: true,
    errors: []
  };
}

export function validateEmail(email: string): boolean {
  return z.string().email().safeParse(email).success;
}