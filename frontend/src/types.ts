export type UserRole = 'CUSTOMER' | 'ADMIN';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type SubmissionStatus = 'PENDING' | 'REVIEWED' | 'APPROVED' | 'ARCHIVED';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isSuperAdmin?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  message?: string;
}

export interface SubmissionInput {
  firstName: string;
  lastName: string;
  email: string;
  gender: Gender;
  mobileNumber: string;
  address: string;
  feedback?: string;
  status?: SubmissionStatus;
}

export interface Submission extends SubmissionInput {
  id: string;
  status: SubmissionStatus;
  createdAt: string;
  updatedAt?: string;
  userModified?: string;
  dateModified?: string;
  submittedBy?: string;
}

export interface GetSubmissionsParams {
  search?: string;
  gender?: Gender | 'ALL';
}

export interface CreateAdminResponse {
  message: string;
  temporaryPassword?: string;
  admin?: {
    id: string;
    email: string;
    role: 'ADMIN';
  };
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string>;
}
