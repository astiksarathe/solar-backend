import { AuthService } from './auth.service';
import * as db from '../db/pg.provider';
import { QueryResult } from 'pg';

jest.mock('../db/pg.provider');

describe('AuthService.register', () => {
  let svc: AuthService;

  beforeEach(() => {
    svc = new AuthService();
    jest.resetAllMocks();
  });

  it('should reject admin role registration', async () => {
    await expect(
      svc.register('alice', 'password123', 'a@b.com', '123', 'admin'),
    ).rejects.toThrow('Cannot register admin via public endpoint');
  });

  it('should insert a normal user', async () => {
    const mockQuery = db.query as jest.MockedFunction<typeof db.query>;
    const mockRes: QueryResult<Record<string, unknown>> = {
      command: 'SELECT',
      rowCount: 1,
      oid: 0,
      rows: [{ id: 1 }],
      fields: [],
    };

    mockQuery.mockResolvedValue(mockRes);

    const res = await svc.register('bob', 'secretpw', 'b@c.com', '555', 'user');
    expect(res).toBeDefined();
    expect(res.username).toBe('bob');
    expect(mockQuery).toHaveBeenCalled();
  });
});
