import { Users } from '../../user/user.entity';

export interface AuthResponse {
  access_token: string;
  user: Partial<Users> & {
    roles: string[];
  };
}
