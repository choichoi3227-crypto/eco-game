import { getDb } from '../../../db/client';
import { ogImageCache } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { generateOgImage } from '../../../lib/og-image-generator';
import { uploadToGitHub } from '../../../lib/github-storage';

export const GET = async ({ params, locals }: any) => {
  const cacheKey = params.id;
  const env = locals.runtime.env;
  const db = getDb(env);

  // 1. D1 캐시 확인
  const cached = await db.select().from(ogImageCache).where(eq(ogImageCache.id, cacheKey)).get();
  if (cached) {
    // 404 체크를 위해 가벼운 HEAD 요청 (선택 사항)
    const check = await fetch(cached.url, { method: 'HEAD' });
    if (check.ok) return Response.redirect(cached.url, 302);
    await db.delete(ogImageCache).where(eq(ogImageCache.id, cacheKey)).run();
  }

  // 2. KV 기반 중복 생성 방지 락 (DO의 Serialization 역할 대체)
  const lockKey = `lock:og:${cacheKey}`;
  const isGenerating = await env.SESSION_KV.get(lockKey);
  
  if (isGenerating) {
    // 이미 생성 중이라면 플레이스홀더로 보냄
    return Response.redirect('/og-generating.png', 302);
  }

  // 락 설정 (300초 동안 유효)
  await env.SESSION_KV.put(lockKey, 'true', { expirationTtl: 300 });

  // 3. 백그라운드에서 이미지 생성 및 직접 업로드
  locals.runtime.ctx.waitUntil((async () => {
    try {
      const pngBuffer = await generateOgImage(cacheKey, env);
      const base64Content = btoa(String.fromCharCode(...new Uint8Array(pngBuffer)));

      // 함수 직접 호출 (DO를 거치지 않음)
      const result = await uploadToGitHub(env, {
        filePath: `og/${cacheKey}.png`,
        fileContent: base64Content,
        commitMessage: `Auto-sync OG for ${cacheKey}`
      });

      // D1 캐시 업데이트
      await db.insert(ogImageCache).values({
        id: cacheKey,
        url: result.url,
        sha: result.sha,
        updatedAt: new Date()
      }).onConflictDoUpdate({
        target: ogImageCache.id,
        set: { url: result.url, sha: result.sha, updatedAt: new Date() }
      }).run();
    } catch (e) {
      console.error(`[OG Sync Error] ${cacheKey}:`, e);
    } finally {
      // 작업 완료 후 락 해제
      await env.SESSION_KV.delete(lockKey);
    }
  })());

  return Response.redirect('/og-generating.png', 302);
};
