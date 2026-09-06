import { z } from 'zod';

export const registerSchema = z
  .object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(4, 'Password must be at least 4 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const createAdminSchema = z.object({
  email: z.string().email('Invalid email format'),
});