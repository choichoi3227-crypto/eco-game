import type { APIRoute } from 'astro';
import { getDb } from '../../../db/client';
import { users } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword } from '../../../lib/crypto';
import { createSession } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  const { username, password } = await request.json();
  const db = getDb(locals.runtime.env);

  const user = await db.query.users.findFirst({ where: eq(users.username, username) });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return new Response(JSON.stringify({ message: 'Invalid credentials' }), { status: 401 });
  }

  const token = await createSession(locals.runtime.env, user);
  cookies.set('auth_token', token, { path: '/', httpOnly: true, secure: true, sameSite: 'strict', maxAge: 86400 });

  return new Response(JSON.stringify({ success: true, role: user.role }));
};
