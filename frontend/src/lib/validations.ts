import { z } from 'zod';

// Customer Registration Schema
export const registerSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(4, 'Password must be at least 4 characters long'),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// Customer & Admin Login Schema
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Mobile number regex matching /^(0\d{9}|\+\d{11})$/
// Format: 0 followed by 9 digits (total 10 digits) OR + followed by 11 digits (total 12 chars)
const mobilePhoneRegex = /^(0\d{9}|\+\d{11})$/;

// Customer Application Submission Schema
export const submissionSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(50, 'First name cannot exceed 50 characters'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .max(50, 'Last name cannot exceed 50 characters'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
    message: 'Please select a valid gender option',
  }),
  mobileNumber: z
    .string()
    .trim()
    .min(1, 'Mobile number is required')
    .regex(
      /^(0\d{9}|\+\d{11})$/,
      'Mobile number must be in format 0XXXXXXXXX (10 digits) or +XXXXXXXXXXX (11 digits with +)',
    ),
  address: z
    .string()
    .trim()
    .min(5, 'Please provide a complete street address (min 5 characters)')
    .max(200, 'Address cannot exceed 200 characters'),
  feedback: z
    .string()
    .trim()
    .max(1000, 'Feedback cannot exceed 1000 characters')
    .optional()
    .or(z.literal('')),
  status: z
    .enum(['PENDING', 'REVIEWED', 'APPROVED', 'ARCHIVED'])
    .optional(),
});

export type SubmissionFormData = z.infer<typeof submissionSchema>;

// Admin Creation Schema
export const createAdminSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
});

export type CreateAdminFormData = z.infer<typeof createAdminSchema>;
