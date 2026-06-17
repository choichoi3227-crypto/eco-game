import type { APIRoute } from 'astro';
import { getDb } from '../../../db/client';
import { gameResults } from '../../../db/schema';
import { jwtVerify } from 'jose';

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  const { correct, incorrect } = await request.json();
  const token = cookies.get('auth_token')?.value;
  const env = locals.runtime.env;
  
  let userId = null;
  if (token) {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(env.JWT_SECRET));
    userId = payload.id as string;
  }

  const db = getDb(env);
  await db.insert(gameResults).values({
    userId,
    correct,
    incorrect,
    createdAt: new Date()
  }).run();

  return new Response(JSON.stringify({ success: true }));
};
