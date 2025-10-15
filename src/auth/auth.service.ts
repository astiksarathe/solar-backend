import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { query } from '../db/pg.provider';
import { hash, compare } from 'bcryptjs';
import { sign } from './jwt.util';

type UserRow = {
  id: number;
  username: string;
  password_hash: string;
  roles: string[];
  is_approved: boolean;
};

type HashFn = (password: string, salt: string | number) => Promise<string>;
type CompareFn = (plaintext: string, hashed: string) => Promise<boolean>;

@Injectable()
export class AuthService {
  async register(
    username: string | undefined,
    password: string,
    email: string,
    phone?: string,
    role?: string,
  ) {
    const r = role ?? 'user';
    // Prevent public registration with admin role. Only an existing admin may assign that.
    if (r === 'admin') {
      throw new UnauthorizedException(
        'Cannot register admin via public endpoint',
      );
    }
    // Basic server-side validation in addition to DTO validation
    if (!password || password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }
    // require at least one letter and one number
    if (!/(?=.*[A-Za-z])(?=.*\d).+/.test(password)) {
      throw new BadRequestException('Password must contain at least one letter and one number');
    }

    // normalize email (trim + lowercase) and derive username if not provided
    const normalizedEmail = email.trim().toLowerCase();
    email = normalizedEmail;

    let finalUsername = username;
    if (!finalUsername) {
      const local = normalizedEmail.split('@')[0];
      finalUsername = local || normalizedEmail.replace(/@.*$/, '');
    }

    // ensure email uniqueness if email provided
    if (email) {
      const existing = (await query<{ id: number }>(
        'SELECT id FROM users WHERE LOWER(email)=$1 LIMIT 1',
        [normalizedEmail],
      )) as unknown as { rows: { id: number }[] };
      if (existing.rows.length > 0) {
        throw new BadRequestException('Email already in use');
      }
    }

    // ensure username won't violate unique constraint: if exists, append suffix
    const nameCheck = (await query<{ id: number }>(
      'SELECT id FROM users WHERE username=$1 LIMIT 1',
      [finalUsername],
    )) as unknown as { rows: { id: number }[] };
    if (nameCheck.rows.length > 0) {
      // append timestamp suffix to avoid collisions
      finalUsername = `${finalUsername}_${Date.now().toString().slice(-4)}`;
    }
  const hashFn = hash as unknown as HashFn;
  const hashVal = await hashFn(password, 10);
    // employees require admin approval
    const isApproved = r === 'employee' ? false : true;
    await query(
      'INSERT INTO users (username, password_hash, email, phone, roles, is_approved) VALUES ($1, $2, $3, $4, $5, $6)',
      [finalUsername, hashVal, email, phone, [r], isApproved],
    );
    return { username: finalUsername, email, phone, role: r, isApproved };
  }

  async validateUser(username: string, password: string) {
    // The `query` helper performs a runtime cast of the pg client result.
    // ESLint may consider that an `error`-typed value; narrow it locally.
    const res = (await query<UserRow>(
      'SELECT id, username, password_hash, roles, is_approved FROM users WHERE username=$1',
      [username],
    )) as unknown as { rows: UserRow[] };

    const row = res.rows[0] as UserRow | undefined;
    if (!row) return null;
    const passwordHash = row.password_hash;
    if (!passwordHash) return null;
    const compareFn = compare as unknown as CompareFn;
    const ok = await compareFn(password, passwordHash);
    if (!ok) return null;
    if (!row.is_approved) return null;
    return { id: row.id, username: row.username, roles: row.roles };
  }

  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const token = sign(
      { sub: user.id, username: user.username, roles: user.roles },
      { expiresIn: '7d' },
    );
    return { accessToken: token };
  }

  async approveUser(userId: number) {
    await query('UPDATE users SET is_approved = true WHERE id = $1', [userId]);
    // insert audit log
    await query(
      'INSERT INTO activity_logs (entity_type, entity_id, action, actor, changes) VALUES ($1, $2, $3, $4, $5)',
      [
        'user',
        String(userId),
        'approve',
        'system',
        JSON.stringify({ approved: true }),
      ],
    );
    return { ok: true };
  }
}
