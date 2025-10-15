import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? 'change-me-in-prod';

export type JwtPayload = {
  sub: number | string;
  username?: string;
  roles?: string[];
  iat?: number;
  exp?: number;
};

export function sign(payload: object, opts?: jwt.SignOptions): string {
  return jwt.sign(payload, JWT_SECRET, opts);
}

export function verify(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
