import { getDb } from '../../../db/client';
import { ogImageCache } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { getShardId } from '../../../lib/sharding';
import { generateOgImage } from '../../../lib/og-image-generator';

export const GET = async ({ params, locals }: any) => {
  const cacheKey = params.id;
  const env = locals.runtime.env;
  const db = getDb(env);

  // 1. 캐시 확인 및 404 정화
  const cached = await db.select().from(ogImageCache).where(eq(ogImageCache.id, cacheKey)).get();
  if (cached) {
    const check = await fetch(cached.url, { method: 'HEAD' });
    if (check.ok) return Response.redirect(cached.url, 302);
    await db.delete(ogImageCache).where(eq(ogImageCache.id, cacheKey)).run();
  }

  // 2. Generating 상태 체크 (KV)
  const isGenerating = await env.SESSION_KV.get(`gen:${cacheKey}`);
  if (isGenerating) return Response.redirect('/og-generating.png', 302);

  // 3. 백그라운드 생성 및 업로드 (Sharded DO)
  await env.SESSION_KV.put(`gen:${cacheKey}`, 'true', { expirationTtl: 300 });

  locals.runtime.ctx.waitUntil((async () => {
    try {
      const png = await generateOgImage(cacheKey, env);
      const shard = getShardId(env, cacheKey); // lib/sharding.ts 참고
      const uploadRes = await env.GITHUB_QUEUE_DO.get(shard).fetch('http://do/upload', {
        method: 'POST',
        body: JSON.stringify({
          filePath: `og/${cacheKey}.png`,
          fileContent: btoa(String.fromCharCode(...new Uint8Array(png))),
          commitMessage: `Update OG for ${cacheKey}`
        })
      });
      
      if (uploadRes.ok) {
        const { url, sha } = await uploadRes.json();
        await db.insert(ogImageCache).values({ 
          id: cacheKey, url, sha, updatedAt: new Date() 
        }).onConflictDoUpdate({ target: ogImageCache.id, set: { url, sha, updatedAt: new Date() } }).run();
      }
    } finally {
      await env.SESSION_KV.delete(`gen:${cacheKey}`);
    }
  })());

  return Response.redirect('/og-generating.png', 302);
};
