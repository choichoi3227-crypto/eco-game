import type { APIRoute } from 'astro';
import { getDb } from '../../../db/client';
import { users } from '../../../db/schema';
import { sql, and, gte } from 'drizzle-orm';

export const GET: APIRoute = async ({ locals, url }) => {
  if (!locals.user || locals.user.role !== 'admin') {
    return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
  }

  const range = url.searchParams.get('range') || 'all'; // '7d', '30d', 'all'
  const db = getDb(locals.runtime.env);

  let dateFilter = sql`1=1`; // 기본값 (전체 기간)
  if (range === '7d') {
    dateFilter = sql`created_at > strftime('%s', 'now', '-7 days')`;
  } else if (range === '30d') {
    dateFilter = sql`created_at > strftime('%s', 'now', '-30 days')`;
  }

  const stats = await db.select({
    // 7일 필터면 일별(day), 아니면 월별(month)로 그룹화하여 더 세밀하게 표시
    label: range === '7d' 
      ? sql<string>`strftime('%m-%d', datetime(created_at, 'unixepoch'))`
      : sql<string>`strftime('%Y-%m', datetime(created_at, 'unixepoch'))`,
    count: sql<number>`count(*)`
  })
  .from(users)
  .where(dateFilter)
  .groupBy(sql`label`)
  .orderBy(sql`label`)
  .all();

  return new Response(JSON.stringify(stats), {
    headers: { 'Content-Type': 'application/json' }
  });
};
