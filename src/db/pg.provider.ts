import { Pool, QueryResult, QueryResultRow, PoolClient } from 'pg';

const connectionString =
  process.env.DATABASE_URL ??
  'postgres://postgres:postgres@localhost:5432/solar_dev';

export const pool = new Pool({ connectionString });

// Simple query helper returning raw result (keeps typing minimal for now)
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[],
): Promise<QueryResult<T>> {
  const client: PoolClient = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res as QueryResult<T>;
  } finally {
    client.release();
  }
}
