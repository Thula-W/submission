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
    .min(7, 'Mobile number is too short')
    .max(15, 'Mobile number is too long')
    .regex(/^[0-9+]+$/, 'Mobile number can only contain digits and a leading +'),
  address: z.string().min(1, 'Address is required'),
  feedback: z.string().optional(),
});

export const updateSubmissionSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  mobileNumber: z.string().min(7).max(15).regex(/^[0-9+]+$/).optional(),
  address: z.string().min(1).optional(),
  feedback: z.string().nullable().optional(),
  status: z.enum(['PENDING', 'REVIEWED', 'APPROVED', 'ARCHIVED']).optional(),
});