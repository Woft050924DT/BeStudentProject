import { Users } from '../../user/user.entity';

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  user: Partial<Users> & {
    roles: string[];
  };
}

export interface TokenPayload {
  sub: string;
  email?: string;
  fullName?: string;
  roles?: string[];
  studentId?: number;
  instructorId?: number;
}
