import { UserRole, UserStatus } from '../../user/user.schema';

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: UserRole;
    status: UserStatus;
    firstName?: string;
    lastName?: string;
    fullName?: string;
  };
}

export interface AuthUser {
  userId: string;
  email: string;
  username: string;
  role: UserRole;
  status: UserStatus;
  permissions?: string[];
}

export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
  role: UserRole;
  status: UserStatus;
  permissions?: string[];
  iat?: number;
  exp?: number;
}
