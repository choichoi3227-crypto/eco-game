import { getDb } from '../../../db/client';
import { ogImageCache } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { generateOgImage } from '../../../lib/og-image-generator';
import { uploadToGitHubDirect } from '../../../lib/github-storage';

export const GET = async ({ params, locals }: any) => {
  const cacheKey = params.id;
  const env = locals.runtime.env;
  const db = getDb(env);

  // 1. D1 캐시 확인
  const cached = await db.select().from(ogImageCache).where(eq(ogImageCache.id, cacheKey)).get();
  if (cached) {
    // URL 유효성 검사 (생략 가능하나 안정성을 위해 유지)
    const check = await fetch(cached.url, { method: 'HEAD' });
    if (check.ok) return Response.redirect(cached.url, 302);
    await db.delete(ogImageCache).where(eq(ogImageCache.id, cacheKey)).run();
  }

  // 2. KV 기반 Mutex Lock (DO의 직렬화 대체)
  const lockKey = `lock:og:${cacheKey}`;
  const isLocked = await env.SESSION_KV.get(lockKey);
  
  if (isLocked) {
    // 현재 생성 중이면 플레이스홀더 이미지 반환
    return Response.redirect('/og-generating.png', 302);
  }

  // 락 설정 (5분 후 자동 해제)
  await env.SESSION_KV.put(lockKey, 'true', { expirationTtl: 300 });

  // 3. 백그라운드 작업 수행 (ctx.waitUntil)
  locals.runtime.ctx.waitUntil((async () => {
    try {
      const pngBuffer = await generateOgImage(cacheKey, env);
      const base64Content = btoa(String.fromCharCode(...new Uint8Array(pngBuffer)));

      // DO 호출 대신 직접 함수 호출
      const uploadResult = await uploadToGitHubDirect(env, {
        filePath: `og/${cacheKey}.png`,
        fileContent: base64Content,
        commitMessage: `Auto-sync OG for ${cacheKey}`
      });

      // D1 캐시 업데이트
      await db.insert(ogImageCache).values({
        id: cacheKey,
        url: uploadResult.url,
        sha: uploadResult.sha,
        updatedAt: new Date()
      }).onConflictDoUpdate({
        target: ogImageCache.id,
        set: { url: uploadResult.url, sha: uploadResult.sha, updatedAt: new Date() }
      }).run();

    } catch (e) {
      console.error(`[OG Error] ${cacheKey}:`, e);
    } finally {
      // 작업 완료 후 락 해제
      await env.SESSION_KV.delete(lockKey);
    }
  })());

  // 즉시 플레이스홀더 반환하여 사용자 체류 시간 최적화
  return Response.redirect('/og-generating.png', 302);
};
