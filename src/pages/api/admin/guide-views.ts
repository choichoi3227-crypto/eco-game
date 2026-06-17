import type { APIRoute } from 'astro';
import { getDb } from '../../../db/client';
import { guides } from '../../../db/schema';
import { desc } from 'drizzle-orm';

export const GET: APIRoute = async ({ locals }) => {
  // 관리자 권한 확인 로직 (middleware에서 locals.user가 설정되었다고 가정)
  if (!locals.user || locals.user.role !== 'admin') {
    return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
  }

  const db = getDb(locals.runtime.env);
  const guideViews = await db.select({
    title: guides.title,
    views: guides.views
  }).from(guides).orderBy(desc(guides.views)).limit(10).all(); // 상위 10개 가이드

  return new Response(JSON.stringify(guideViews), {
    headers: { 'Content-Type': 'application/json' }
  });
};
