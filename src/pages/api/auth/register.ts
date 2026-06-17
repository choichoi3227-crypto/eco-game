import type { APIRoute } from 'astro';
import { getDb } from '../../../db/client';
import { users } from '../../../db/schema';
import { hashPassword } from '../../../lib/crypto';

export const POST: APIRoute = async ({ request, locals }) => {
  const { username, password } = await request.json();
  const db = getDb(locals.runtime.env);
  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password);

  try {
    await db.insert(users).values({ id, username, passwordHash, role: 'user' }).run();
    return new Response(JSON.stringify({ success: true }), { status: 201 });
  } catch (e) {
    return new Response(JSON.stringify({ message: 'User already exists' }), { status: 400 });
  }
};
