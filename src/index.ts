import { getDb } from './db/client';
import { githubFailureLogs } from './db/schema';
import { sql, eq } from 'drizzle-orm';

export default {
  async scheduled(event: any, env: any, ctx: any) {
    const db = getDb(env);
    
    // 1. 인기 가이드 스코어 갱신
    ctx.waitUntil(db.run(sql`
      UPDATE guides SET popularity_score = (views * 0.3 + (SELECT COUNT(*) FROM game_results WHERE target_slug = guides.slug) * 0.7)
    `));

    // 2. 장애 감지 및 관리자 알림 (Discord)
    const failures = await db.select().from(githubFailureLogs).where(eq(githubFailureLogs.notified, false)).all();
    if (failures.length > 5 && env.DISCORD_WEBHOOK_URL) {
      await fetch(env.DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: `🚨 **CloudPress 장애 리포트**\n현재 GitHub API 장애가 ${failures.length}건 감지되었습니다.` 
        })
      });
      await db.update(githubFailureLogs).set({ notified: true }).run();
    }
  }
};
