import { z } from 'zod';

export const createSubmissionSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
    errorMap: () => ({ message: 'Gender must be MALE, FEMALE, or OTHER' }),
  }),
  mobileNumber: z
  .string()
  .trim()
  .regex(
    /^(0\d{9}|\+\d{11})$/,
    'Mobile number must be either 10 digits starting with 0 (e.g., 0712345678) or 11 digits starting with + (e.g., +94712345678)'),
  address: z.string().min(1, 'Address is required'),
  feedback: z.string().optional(),
});

export const updateSubmissionSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  mobileNumber: z
  .string()
  .trim()
  .regex(
    /^(0\d{9}|\+\d{11})$/,
    'Mobile number must be either 10 digits starting with 0 (e.g., 0712345678) or 11 digits starting with + (e.g., +94712345678)'
  )
  .optional(),
  address: z.string().min(1).optional(),
  feedback: z.string().nullable().optional(),
  status: z.enum(['PENDING', 'REVIEWED', 'APPROVED', 'ARCHIVED']).optional(),
});