import type { APIRoute } from 'astro';
import { getDb } from '../../../db/client';
import { users } from '../../../db/schema';
import { sql } from 'drizzle-orm';

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user || locals.user.role !== 'admin') {
    return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
  }

  const db = getDb(locals.runtime.env);
  
  // SQLite의 strftime을 사용하여 월별 그룹화 (Unix 타임스탬프 변환 포함)
  const stats = await db.select({
    month: sql<string>`strftime('%Y-%m', datetime(created_at, 'unixepoch'))`,
    count: sql<number>`count(*)`
  })
  .from(users)
  .groupBy(sql`month`)
  .orderBy(sql`month`)
  .all();

  return new Response(JSON.stringify(stats), {
    headers: { 'Content-Type': 'application/json' }
  });
};
