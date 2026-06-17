import type { APIRoute } from 'astro';
import { getDb } from '../../../db/client';
import { users } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { jwtVerify } from 'jose';

const XP_PER_CORRECT_ANSWER = 10; // 정답 1개당 획득 경험치
const XP_TO_LEVEL_UP_BASE = 100; // 레벨업에 필요한 기본 경험치

// 레벨업에 필요한 경험치 계산 함수 (예: 100, 200, 400, 800...)
function getXpForNextLevel(level: number): number {
  return XP_TO_LEVEL_UP_BASE * Math.pow(2, level - 1);
}

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  const { isCorrect } = await request.json(); // 게임에서 정답 여부 전달
  const token = cookies.get('auth_token')?.value;
  const env = locals.runtime.env;

  if (!token) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(env.JWT_SECRET));
    const userId = payload.id as string;
    const db = getDb(env);

    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user) {
      return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });
    }

    let newXp = user.experiencePoints || 0;
    let newLevel = user.level || 1;
    let leveledUp = false;

    if (isCorrect) {
      newXp += XP_PER_CORRECT_ANSWER;
      
      // 레벨업 체크
      let xpNeeded = getXpForNextLevel(newLevel);
      while (newXp >= xpNeeded) {
        newLevel++;
        leveledUp = true;
        xpNeeded = getXpForNextLevel(newLevel);
      }
    }

    await db.update(users)
      .set({ experiencePoints: newXp, level: newLevel })
      .where(eq(users.id, userId))
      .run();

    return new Response(JSON.stringify({
      success: true,
      experiencePoints: newXp,
      level: newLevel,
      leveledUp: leveledUp,
      xpForNextLevel: getXpForNextLevel(newLevel)
    }));

  } catch (error) {
    console.error('XP API Error:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
};
