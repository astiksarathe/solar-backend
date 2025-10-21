export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
}

export interface AuthUser {
  userId: string;
  email: string;
  username: string;
  role: string;
}
