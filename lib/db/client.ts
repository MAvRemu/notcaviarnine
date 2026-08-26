import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

/**
 * Neon over HTTP — one stateless query per call, ideal for Vercel functions.
 * `db` is null when DATABASE_URL is not configured; callers must degrade.
 */
export const hasDb = () => Boolean(process.env.DATABASE_URL);

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;
export function db() {
  if (!hasDb()) return null;
  if (!_db) _db = drizzle(neon(process.env.DATABASE_URL!), { schema });
  return _db;
}
