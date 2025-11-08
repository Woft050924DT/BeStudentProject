import { Request } from 'express';

export interface AuthenticatedUser {
  id: number;
  userId: number;
  email?: string;
  fullName?: string;
  role: string;
  roles: string[];
  studentId?: number;
  instructorId?: number;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

